// server/src/services/idempotencyService.js
// Ensures the same clientId never creates two reports

const { pool } = require("../config/db");
const { generateUuid } = require("../utils/uuid");

/**
 * Upsert a report by clientId.
 * Returns { report, duplicate, updated }.
 */
async function upsertReport(payload) {
  const {
    clientId,
    category,
    description,
    location,
    latitude,
    longitude,
    priority,
    status,
    createdBy,
    assignedTo,
    reportedAt,
    clientUpdatedAt,
  } = payload;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Look for existing row
    const [existingRows] = await connection.query(
      "SELECT * FROM reports WHERE client_id = ? LIMIT 1",
      [clientId],
    );

    // --- Case A: report does not exist → INSERT ---
    if (existingRows.length === 0) {
      const newId = generateUuid();

      await connection.query(
        `INSERT INTO reports (
          id, client_id, category, description, location,
          latitude, longitude, priority, status,
          created_by, assigned_to, reported_at,
          client_updated_at, sync_version, deleted
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, FALSE)`,
        [
          newId,
          clientId,
          category,
          description,
          location,
          latitude ?? null,
          longitude ?? null,
          priority,
          status,
          createdBy,
          assignedTo ?? null,
          new Date(reportedAt),
          new Date(clientUpdatedAt),
        ],
      );

      const [createdRows] = await connection.query(
        "SELECT * FROM reports WHERE id = ? LIMIT 1",
        [newId],
      );

      await connection.commit();
      return { report: createdRows[0], duplicate: false, updated: false };
    }

    // --- Case B: report exists → check version ---
    const existing = existingRows[0];

    const clientTime = new Date(clientUpdatedAt).getTime();
    const serverClientTime = new Date(existing.client_updated_at).getTime();

    if (clientTime > serverClientTime) {
      // Client is newer → update
      await connection.query(
        `UPDATE reports SET
          category = ?,
          description = ?,
          location = ?,
          latitude = ?,
          longitude = ?,
          priority = ?,
          status = ?,
          created_by = ?,
          assigned_to = ?,
          reported_at = ?,
          client_updated_at = ?,
          sync_version = sync_version + 1
        WHERE client_id = ?`,
        [
          category,
          description,
          location,
          latitude ?? null,
          longitude ?? null,
          priority,
          status,
          createdBy,
          assignedTo ?? null,
          new Date(reportedAt),
          new Date(clientUpdatedAt),
          clientId,
        ],
      );

      const [updatedRows] = await connection.query(
        "SELECT * FROM reports WHERE client_id = ? LIMIT 1",
        [clientId],
      );

      await connection.commit();
      return { report: updatedRows[0], duplicate: true, updated: true };
    }

    // Client is older or same → return existing (idempotent no-op)
    await connection.commit();
    return { report: existing, duplicate: true, updated: false };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

module.exports = { upsertReport };
