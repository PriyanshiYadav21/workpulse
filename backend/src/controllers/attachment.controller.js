const db = require('../config/db');
const fs = require('fs');
const path = require('path');

async function listAttachments(req, res, next) {
  try {
    const [rows] = await db.query(
      `SELECT a.*, u.name AS uploader_name
       FROM attachments a
       JOIN users u ON u.id = a.uploaded_by
       WHERE a.task_id = ?
       ORDER BY a.created_at DESC`,
      [req.params.taskId]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function uploadAttachment(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const [result] = await db.query(
      `INSERT INTO attachments (task_id, uploaded_by, filename, filepath, mimetype, size)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        req.params.taskId,
        req.user.id,
        req.file.originalname,
        `/uploads/${req.file.filename}`,
        req.file.mimetype,
        req.file.size,
      ]
    );
    const [rows] = await db.query('SELECT * FROM attachments WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function deleteAttachment(req, res, next) {
  try {
    const [rows] = await db.query(
      'SELECT * FROM attachments WHERE id = ? AND uploaded_by = ?',
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Attachment not found' });

    const filePath = path.join(process.cwd(), rows[0].filepath.replace(/^\/+/, ''));
    fs.promises.unlink(filePath).catch(() => {});

    await db.query('DELETE FROM attachments WHERE id = ?', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { listAttachments, uploadAttachment, deleteAttachment };
