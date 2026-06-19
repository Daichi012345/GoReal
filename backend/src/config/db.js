require("dotenv").config();

const mysql = require("mysql2");

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || process.env.MYSQL_ROOT_PASSWORD || 'root',
  database: process.env.DB_NAME || process.env.MYSQL_DATABASE || 'goreal_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const poolPromise = pool.promise();

pool.getConnection((err, connection) => {
  if (err) {
    console.error('DB接続失敗', err);
    return;
  }
  if (connection) connection.release();
  console.log('DB接続成功 (pool)');
});

// Export an object that provides both `query` and `promise()` to match existing usage
module.exports = {
  // direct query convenience (used in some controllers)
  query: (...args) => poolPromise.query(...args),
  execute: (...args) => poolPromise.execute(...args),
  // promise() accessor (used elsewhere as db.promise().query(...))
  promise: () => poolPromise,
};