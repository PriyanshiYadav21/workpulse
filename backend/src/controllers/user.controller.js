const bcrypt = require('bcryptjs');
const { z } = require('zod');
const db = require('../config/db');

const updateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional().nullable(),
  avatar_url: z.string().max(500).optional().nullable(),
});

const passwordSchema = z.object({
  current_password: z.string().min(1),
  new_password: z.string().min(6).max(72),
});

async function listUsers(req, res, next) {
  try {
    const [rows] = await db.query(
      `SELECT id, name, email, role, avatar_url FROM users ORDER BY name ASC LIMIT 100`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const data = updateSchema.parse(req.body);
    const fields = [];
    const params = [];
    for (const k of ['name', 'bio', 'avatar_url']) {
      if (k in data) {
        fields.push(`${k} = ?`);
        params.push(data[k]);
      }
    }
    if (!fields.length) return res.status(400).json({ message: 'No fields' });
    params.push(req.user.id);
    await db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);

    const [rows] = await db.query(
      'SELECT id, name, email, role, avatar_url, bio FROM users WHERE id = ?',
      [req.user.id]
    );
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { current_password, new_password } = passwordSchema.parse(req.body);
    const [rows] = await db.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    if (!rows.length) return res.status(404).json({ message: 'User not found' });

    const ok = await bcrypt.compare(current_password, rows[0].password);
    if (!ok) return res.status(401).json({ message: 'Current password incorrect' });

    const hash = await bcrypt.hash(new_password, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hash, req.user.id]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

async function setRole(req, res, next) {
  try {
    const schema = z.object({ role: z.enum(['admin', 'manager', 'member']) });
    const { role } = schema.parse(req.body);
    const id = Number(req.params.id);
    const [result] = await db.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'User not found' });
    const [rows] = await db.query('SELECT id, name, email, role, avatar_url FROM users WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    const id = Number(req.params.id);
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'User not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { listUsers, updateProfile, changePassword, setRole, deleteUser };

