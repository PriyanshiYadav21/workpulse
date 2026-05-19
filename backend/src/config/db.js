// Single DB entry point. Picks driver based on DB_DRIVER env var.
// - sqlite : zero-config local file (dev default)
// - mysql  : production target (mysql2/promise pool)
//
// Both return the same shape: a db with .query(sql, params) and .getConnection().

const driver = (process.env.DB_DRIVER || 'sqlite').toLowerCase();

let db;

if (driver === 'mysql') {
  const mysql = require('mysql2/promise');
  const host = process.env.DB_HOST || process.env.MYSQLHOST || 'localhost';
  const port = Number(process.env.DB_PORT || process.env.MYSQLPORT) || 3306;
  const user = process.env.DB_USER || process.env.MYSQLUSER || 'root';
  const password = process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '';
  const database = process.env.DB_NAME || process.env.MYSQLDATABASE || 'workpulse';

  db = mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: true,
  });

  db.getConnection()
    .then((conn) => {
      console.log(`[db] Connected to MySQL database: ${database} on ${host}`);
      conn.release();
    })
    .catch((err) => {
      console.error(`[db] MySQL connection failed (${host}:${port}):`, err.message);
    });
} else {
  db = require('../db/sqliteAdapter');
  console.log(`[db] Using SQLite file: ${process.env.SQLITE_FILE || './data/workpulse.db'}`);
}

module.exports = db;
