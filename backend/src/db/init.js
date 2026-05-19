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

async function initDatabase() {
  const driver = (process.env.DB_DRIVER || 'sqlite').toLowerCase();
  if (driver === 'sqlite') {
    initSqlite();
  } else {
    console.log('[db] MySQL driver — make sure `mysql < backend/schema.sql` has been applied.');
  }
}

module.exports = { initDatabase };

// Allow direct invocation: `node src/db/init.js`
if (require.main === module) {
  require('dotenv').config();
  initDatabase().then(() => process.exit(0));
}
