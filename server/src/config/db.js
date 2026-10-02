// server/src/config/db.js
// MySQL connection pool using mysql2/promise

const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 8889,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "field_issue_tracker",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4",
  timezone: "Z",
  dateStrings: false,
});

/**
 * Verify the database connection is alive.
 * Returns { ok: true } or { ok: false, error }.
 */
async function checkDatabaseHealth() {
  try {
    const connection = await pool.getConnection();
    try {
      await connection.query("SELECT 1 AS ok");
      return { ok: true };
    } finally {
      connection.release();
    }
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

module.exports = {
  pool,
  checkDatabaseHealth,
};
