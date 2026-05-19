const { z } = require('zod');
const db = require('../config/db');
const { logActivity, notify } = require('../utils/activity');

const STATUSES = ['todo', 'in_progress', 'review', 'done'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

const taskCreateSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional().nullable(),
  status: z.enum(STATUSES).optional(),
  priority: z.enum(PRIORITIES).optional(),
  category: z.string().max(100).optional().nullable(),
  deadline: z.string().optional().nullable(),
  assigned_to: z.number().int().optional().nullable(),
  team_id: z.number().int().optional().nullable(),
});

const taskUpdateSchema = taskCreateSchema.partial().extend({
  position: z.number().int().optional(),
});

async function listTasks(req, res, next) {
  try {
    const { status, priority, q, assigned_to, team_id } = req.query;
    let filters = [];
    let params = [];

    // Admin sees everything
    if (req.user.role === 'admin') {
      filters.push('1');
    // Manager sees tasks they created/assigned or within teams they belong to
    } else if (req.user.role === 'manager') {
      filters.push('(t.created_by = ? OR t.assigned_to = ? OR t.team_id IN (SELECT team_id FROM team_members WHERE user_id = ?))');
      params.push(req.user.id, req.user.id, req.user.id);
    } else {
      // member: only creator or assignee
      filters.push('(t.created_by = ? OR t.assigned_to = ?)');
      params.push(req.user.id, req.user.id);
    }

    if (status && STATUSES.includes(status)) {
      filters.push('t.status = ?');
      params.push(status);
    }
    if (priority && PRIORITIES.includes(priority)) {
      filters.push('t.priority = ?');
      params.push(priority);
    }
    if (assigned_to) {
      filters.push('t.assigned_to = ?');
      params.push(Number(assigned_to));
    }
    if (team_id) {
      filters.push('t.team_id = ?');
      params.push(Number(team_id));
    }
    if (q) {
      filters.push('(t.title LIKE ? OR t.description LIKE ?)');
      params.push(`%${q}%`, `%${q}%`);
    }

    const [rows] = await db.query(
      `SELECT t.*,
              u1.name AS created_by_name, u1.avatar_url AS created_by_avatar,
              u2.name AS assigned_to_name, u2.avatar_url AS assigned_to_avatar
       FROM tasks t
       LEFT JOIN users u1 ON u1.id = t.created_by
       LEFT JOIN users u2 ON u2.id = t.assigned_to
       WHERE ${filters.join(' AND ')}
       ORDER BY t.position ASC, t.created_at DESC`,
      params
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function getTask(req, res, next) {
  try {
    const [rows] = await db.query(
      `SELECT t.*,
              u1.name AS created_by_name, u1.avatar_url AS created_by_avatar,
              u2.name AS assigned_to_name, u2.avatar_url AS assigned_to_avatar
       FROM tasks t
       LEFT JOIN users u1 ON u1.id = t.created_by
       LEFT JOIN users u2 ON u2.id = t.assigned_to
       WHERE t.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Task not found' });
    const task = rows[0];

    // Permission check: admin or creator or assignee or manager of the team
    if (req.user.role === 'admin' || task.created_by === req.user.id || task.assigned_to === req.user.id) {
      return res.json(task);
    }

    if (req.user.role === 'manager' && task.team_id) {
      const [m] = await db.query('SELECT 1 FROM team_members WHERE team_id = ? AND user_id = ? LIMIT 1', [task.team_id, req.user.id]);
      if (m.length) return res.json(task);
    }

    return res.status(403).json({ message: 'Insufficient permissions' });
  } catch (err) {
    next(err);
  }
}

async function createTask(req, res, next) {
  try {
    const data = taskCreateSchema.parse(req.body);
    const [result] = await db.query(
      `INSERT INTO tasks
        (title, description, status, priority, category, deadline, created_by, assigned_to, team_id, position)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.title,
        data.description || null,
        data.status || 'todo',
        data.priority || 'medium',
        data.category || null,
        data.deadline || null,
        req.user.id,
        data.assigned_to || null,
        data.team_id || null,
        0,
      ]
    );

    await logActivity({
      userId: req.user.id,
      action: 'task.created',
      entityType: 'task',
      entityId: result.insertId,
      details: data.title,
    });

    if (data.assigned_to && data.assigned_to !== req.user.id) {
      await notify(data.assigned_to, `You were assigned: ${data.title}`, 'task', `/tasks`);
    }

    const [rows] = await db.query('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function updateTask(req, res, next) {
  try {
    const data = taskUpdateSchema.parse(req.body);
    const fields = [];
    const params = [];

    // Fetch task to validate permissions
    const [existing] = await db.query('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    if (!existing.length) return res.status(404).json({ message: 'Task not found' });
    const task = existing[0];

    // Member: may only update `status` on tasks assigned to them
    if (req.user.role === 'member') {
      if (task.assigned_to !== req.user.id) return res.status(403).json({ message: 'Insufficient permissions' });
      // Allow only status
      const allowed = ['status'];
      const invalid = Object.keys(data).some((k) => !allowed.includes(k));
      if (invalid) return res.status(403).json({ message: 'Members may only update status' });
    }

    // Manager: allow if member of the task's team (or if task has no team, allow only creator/assignee)
    if (req.user.role === 'manager' && task.team_id) {
      const [m] = await db.query('SELECT 1 FROM team_members WHERE team_id = ? AND user_id = ? LIMIT 1', [task.team_id, req.user.id]);
      if (!m.length && task.created_by !== req.user.id && task.assigned_to !== req.user.id) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }
    }

    for (const key of [
      'title', 'description', 'status', 'priority', 'category',
      'deadline', 'assigned_to', 'team_id', 'position',
    ]) {
      if (key in data) {
        fields.push(`${key} = ?`);
        params.push(data[key]);
      }
    }

    if (!fields.length) return res.status(400).json({ message: 'No fields to update' });

    params.push(req.params.id);
    const [result] = await db.query(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`, params);

    if (!result.affectedRows) return res.status(404).json({ message: 'Task not found' });

    await logActivity({
      userId: req.user.id,
      action: 'task.updated',
      entityType: 'task',
      entityId: Number(req.params.id),
      details: Object.keys(data).join(', '),
    });

    const [rows] = await db.query('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function deleteTask(req, res, next) {
  try {
    const id = Number(req.params.id);
    const [rows] = await db.query('SELECT * FROM tasks WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ message: 'Task not found' });
    const task = rows[0];

    let allowed = false;
    if (req.user.role === 'admin') allowed = true;
    if (task.created_by === req.user.id) allowed = true;
    if (!allowed && req.user.role === 'manager' && task.team_id) {
      const [m] = await db.query('SELECT 1 FROM team_members WHERE team_id = ? AND user_id = ? LIMIT 1', [task.team_id, req.user.id]);
      if (m.length) allowed = true;
    }

    if (!allowed) return res.status(403).json({ message: 'Insufficient permissions' });

    const [result] = await db.query('DELETE FROM tasks WHERE id = ?', [id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Task not found' });

    await logActivity({
      userId: req.user.id,
      action: 'task.deleted',
      entityType: 'task',
      entityId: Number(req.params.id),
    });

    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

async function reorder(req, res, next) {
  try {
    const schema = z.object({
      items: z.array(z.object({
        id: z.number().int(),
        status: z.enum(STATUSES),
        position: z.number().int(),
      })),
    });
    const { items } = schema.parse(req.body);

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      for (const it of items) {
        await conn.query(
          'UPDATE tasks SET status = ?, position = ? WHERE id = ?',
          [it.status, it.position, it.id]
        );
      }
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { listTasks, getTask, createTask, updateTask, deleteTask, reorder };
