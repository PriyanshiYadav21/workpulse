const { z } = require('zod');
const db = require('../config/db');

const commentSchema = z.object({
  content: z.string().min(1).max(2000),
});

async function listComments(req, res, next) {
  try {
    const [rows] = await db.query(
      `SELECT c.*, u.name AS user_name, u.avatar_url
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.task_id = ?
       ORDER BY c.created_at ASC`,
      [req.params.taskId]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function addComment(req, res, next) {
  try {
    const { content } = commentSchema.parse(req.body);
    const [result] = await db.query(
      'INSERT INTO comments (task_id, user_id, content) VALUES (?, ?, ?)',
      [req.params.taskId, req.user.id, content]
    );
    const [rows] = await db.query(
      `SELECT c.*, u.name AS user_name, u.avatar_url
       FROM comments c JOIN users u ON u.id = c.user_id
       WHERE c.id = ?`,
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function deleteComment(req, res, next) {
  try {
    const [result] = await db.query(
      'DELETE FROM comments WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Comment not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { listComments, addComment, deleteComment };
