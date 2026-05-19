// Bootstrap the database schema.
// - For SQLite: run schema.sqlite.sql automatically on every boot
//   (CREATE TABLE IF NOT EXISTS is idempotent).
// - For MySQL: schema must be applied manually via `mysql < backend/schema.sql`.

const fs = require('fs');
const path = require('path');

function initSqlite() {
  const { raw } = require('./sqliteAdapter');
  const schemaPath = path.join(__dirname, 'schema.sqlite.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');
  raw.exec(sql);
  console.log('[db] SQLite schema ready');
}

async function initMysql() {
  const db = require('../config/db');
  try {
    const [rows] = await db.query("SHOW TABLES LIKE 'users'");
    if (rows.length > 0) {
      console.log('[db] MySQL tables already exist, skipping initialization');
      return;
    }

    console.log('[db] MySQL tables not found, initializing schema...');

    const schemaPath = path.join(__dirname, '../../schema.sql');
    if (!fs.existsSync(schemaPath)) {
      console.error(`[db] Schema file not found at ${schemaPath}`);
      return;
    }

    let sql = fs.readFileSync(schemaPath, 'utf8');

    // Strip out database creation and USE statements as Railway handles database provisioning and names it for us
    sql = sql.replace(/CREATE DATABASE[\s\S]*?USE\s+\w+\s*;/gi, '');

    const statements = sql
      .split(';')
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0);

    for (const stmt of statements) {
      await db.query(stmt);
    }
    console.log('[db] MySQL schema initialized successfully');
  } catch (err) {
    console.error('[db] Failed to initialize MySQL database schema:', err.message);
    throw err;
  }
}

async function initDatabase() {
  const driver = (process.env.DB_DRIVER || 'sqlite').toLowerCase();
  if (driver === 'sqlite') {
    initSqlite();
  } else {
    await initMysql();
  }
}

module.exports = { initDatabase };

// Allow direct invocation: `node src/db/init.js`
if (require.main === module) {
  require('dotenv').config();
  initDatabase().then(() => process.exit(0));
}
