// SQLite adapter exposing a mysql2/promise-compatible API.
// Used as a zero-config dev fallback when DB_DRIVER=sqlite.
//
// Uses Node 22+'s built-in `node:sqlite` module — no native compilation,
// no extra npm install beyond what Node itself ships with.

const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const FILE = process.env.SQLITE_FILE || './data/workpulse.db';
const dir = path.dirname(FILE);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const sqlite = new DatabaseSync(FILE);
sqlite.exec('PRAGMA journal_mode = WAL;');
sqlite.exec('PRAGMA foreign_keys = ON;');

// Translate the MySQL-isms our controllers use to SQLite equivalents.
// Order matters — process DATE_SUB before swapping CURDATE/NOW out from
// underneath it.
function adapt(sql) {
  return sql
    // DATE_SUB(CURDATE(), INTERVAL N DAY)  →  date('now', '-N days')
    .replace(
      /\bDATE_SUB\s*\(\s*CURDATE\(\)\s*,\s*INTERVAL\s+(\d+)\s+DAY\s*\)/gi,
      "date('now', '-$1 days')"
    )
    // DATE_SUB(NOW(), INTERVAL N DAY)  →  datetime('now', '-N days')
    .replace(
      /\bDATE_SUB\s*\(\s*NOW\(\)\s*,\s*INTERVAL\s+(\d+)\s+DAY\s*\)/gi,
      "datetime('now', '-$1 days')"
    )
    .replace(/\bCURDATE\(\)/gi, "date('now')")
    .replace(/\bNOW\(\)/gi, "datetime('now')")
    // SUM(col = 'value')  →  SUM(CASE WHEN col = 'value' THEN 1 ELSE 0 END)
    .replace(
      /SUM\(\s*([a-zA-Z_][\w.]*)\s*=\s*('[^']*')\s*\)/g,
      'SUM(CASE WHEN $1 = $2 THEN 1 ELSE 0 END)'
    )
    // SUM(deadline IS NOT NULL AND deadline < date('now') AND status <> 'done')
    .replace(
      /SUM\(\s*deadline IS NOT NULL AND deadline < date\('now'\) AND status <> 'done'\s*\)/gi,
      "SUM(CASE WHEN deadline IS NOT NULL AND deadline < date('now') AND status <> 'done' THEN 1 ELSE 0 END)"
    )
    .replace(/\bTRUE\b/g, '1')
    .replace(/\bFALSE\b/g, '0');
}

function isSelect(sql) {
  const s = sql.trim().toLowerCase();
  return s.startsWith('select') || s.startsWith('with') || s.startsWith('pragma');
}

function normalizeParams(params) {
  if (!params) return [];
  return params.map((v) => {
    if (typeof v === 'boolean') return v ? 1 : 0;
    if (v === undefined) return null;
    return v;
  });
}

async function query(sql, params) {
  const adapted = adapt(sql);
  const stmt = sqlite.prepare(adapted);
  const args = normalizeParams(params);
  if (isSelect(adapted)) {
    const rows = stmt.all(...args);
    return [rows, undefined];
  }
  const info = stmt.run(...args);
  return [
    {
      insertId: Number(info.lastInsertRowid || 0),
      affectedRows: info.changes,
    },
    undefined,
  ];
}

async function getConnection() {
  let inTx = false;
  return {
    async beginTransaction() {
      if (!inTx) {
        sqlite.exec('BEGIN');
        inTx = true;
      }
    },
    async commit() {
      if (inTx) {
        sqlite.exec('COMMIT');
        inTx = false;
      }
    },
    async rollback() {
      if (inTx) {
        sqlite.exec('ROLLBACK');
        inTx = false;
      }
    },
    query,
    release() {
      if (inTx) {
        try {
          sqlite.exec('ROLLBACK');
        } catch (_) {}
        inTx = false;
      }
    },
  };
}

module.exports = { query, getConnection, raw: sqlite };
