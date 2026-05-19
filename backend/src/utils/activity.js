const db = require('../config/db');

async function logActivity({ userId, action, entityType, entityId, details }) {
  try {
    await db.query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, action, entityType || null, entityId || null, details || null]
    );
  } catch (err) {
    console.error('[activity log]', err.message);
  }
}

async function notify(userId, message, type = 'info', link = null) {
  try {
    await db.query(
      `INSERT INTO notifications (user_id, message, type, link) VALUES (?, ?, ?, ?)`,
      [userId, message, type, link]
    );
  } catch (err) {
    console.error('[notify]', err.message);
  }
}

module.exports = { logActivity, notify };
