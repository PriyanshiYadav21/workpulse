const db = require('../config/db');

async function overview(req, res, next) {
  try {
    const userId = req.user.id;

    const [statusRows] = await db.query(
      `SELECT status, COUNT(*) AS count
       FROM tasks WHERE created_by = ? OR assigned_to = ?
       GROUP BY status`,
      [userId, userId]
    );

    const [priorityRows] = await db.query(
      `SELECT priority, COUNT(*) AS count
       FROM tasks WHERE created_by = ? OR assigned_to = ?
       GROUP BY priority`,
      [userId, userId]
    );

    const [weekly] = await db.query(
      `SELECT DATE(created_at) AS date, COUNT(*) AS count
       FROM tasks
       WHERE (created_by = ? OR assigned_to = ?)
         AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date ASC`,
      [userId, userId]
    );

    const [[totals]] = await db.query(
      `SELECT
         COUNT(*) AS total,
         SUM(status = 'done') AS done,
         SUM(status = 'in_progress') AS in_progress,
         SUM(deadline IS NOT NULL AND deadline < CURDATE() AND status <> 'done') AS overdue
       FROM tasks WHERE created_by = ? OR assigned_to = ?`,
      [userId, userId]
    );

    const [recent] = await db.query(
      `SELECT a.*, u.name AS user_name, u.avatar_url
       FROM activity_logs a
       JOIN users u ON u.id = a.user_id
       WHERE a.user_id = ?
       ORDER BY a.created_at DESC LIMIT 10`,
      [userId]
    );

    res.json({
      totals: {
        total: Number(totals.total || 0),
        done: Number(totals.done || 0),
        in_progress: Number(totals.in_progress || 0),
        overdue: Number(totals.overdue || 0),
      },
      byStatus: statusRows,
      byPriority: priorityRows,
      weekly,
      recent,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { overview };
