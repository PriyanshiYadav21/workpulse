const { z } = require('zod');
const db = require('../config/db');
const { logActivity, notify } = require('../utils/activity');

const teamSchema = z.object({
  name: z.string().min(2).max(150),
  description: z.string().optional().nullable(),
});

async function listTeams(req, res, next) {
  try {
    const [rows] = await db.query(
      `SELECT t.*, tm.role AS member_role,
              (SELECT COUNT(*) FROM team_members WHERE team_id = t.id) AS member_count
       FROM teams t
       JOIN team_members tm ON tm.team_id = t.id
       WHERE tm.user_id = ?
       ORDER BY t.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function createTeam(req, res, next) {
  try {
    const { name, description } = teamSchema.parse(req.body);
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const [result] = await conn.query(
        'INSERT INTO teams (name, description, owner_id) VALUES (?, ?, ?)',
        [name, description || null, req.user.id]
      );
      await conn.query(
        'INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)',
        [result.insertId, req.user.id, 'owner']
      );
      await conn.commit();

      await logActivity({
        userId: req.user.id, action: 'team.created',
        entityType: 'team', entityId: result.insertId, details: name,
      });

      const [rows] = await conn.query('SELECT * FROM teams WHERE id = ?', [result.insertId]);
      res.status(201).json(rows[0]);
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  } catch (err) {
    next(err);
  }
}

async function getTeam(req, res, next) {
  try {
    const [rows] = await db.query('SELECT * FROM teams WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Team not found' });

    const [members] = await db.query(
      `SELECT u.id, u.name, u.email, u.avatar_url, tm.role, tm.joined_at
       FROM team_members tm
       JOIN users u ON u.id = tm.user_id
       WHERE tm.team_id = ?
       ORDER BY tm.joined_at ASC`,
      [req.params.id]
    );

    res.json({ ...rows[0], members });
  } catch (err) {
    next(err);
  }
}

async function inviteMember(req, res, next) {
  try {
    const schema = z.object({
      email: z.string().email(),
      role: z.enum(['admin', 'member']).optional(),
    });
    const { email, role } = schema.parse(req.body);

    const [users] = await db.query('SELECT id, name FROM users WHERE email = ?', [email]);
    if (!users.length) return res.status(404).json({ message: 'No user with that email' });

    try {
      await db.query(
        'INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, ?)',
        [req.params.id, users[0].id, role || 'member']
      );
    } catch (e) {
      const dup =
        e.code === 'ER_DUP_ENTRY' ||
        e.code === 'SQLITE_CONSTRAINT_PRIMARYKEY' ||
        e.code === 'SQLITE_CONSTRAINT_UNIQUE' ||
        (e.message && e.message.includes('UNIQUE constraint failed'));
      if (dup) return res.status(409).json({ message: 'User already in team' });
      throw e;
    }

    await notify(users[0].id, 'You were added to a team', 'team', `/team`);

    res.status(201).json({ ok: true, user: users[0] });
  } catch (err) {
    next(err);
  }
}

async function removeMember(req, res, next) {
  try {
    const [result] = await db.query(
      'DELETE FROM team_members WHERE team_id = ? AND user_id = ?',
      [req.params.id, req.params.userId]
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Member not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { listTeams, createTeam, getTeam, inviteMember, removeMember };
