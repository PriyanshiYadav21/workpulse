// Single DB entry point. Picks driver based on DB_DRIVER env var.
// - sqlite : zero-config local file (dev default)
// - mysql  : production target (mysql2/promise pool)
//
// Both return the same shape: a db with .query(sql, params) and .getConnection().

const driver = (process.env.DB_DRIVER || 'sqlite').toLowerCase();

let db;

if (driver === 'mysql') {
  const mysql = require('mysql2/promise');
  db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'workpulse',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: true,
  });

  db.getConnection()
    .then((conn) => {
      console.log(`[db] Connected to MySQL: ${process.env.DB_NAME}`);
      conn.release();
    })
    .catch((err) => {
      console.error('[db] MySQL connection failed:', err.message);
    });
} else {
  db = require('../db/sqliteAdapter');
  console.log(`[db] Using SQLite file: ${process.env.SQLITE_FILE || './data/workpulse.db'}`);
}

module.exports = db;
