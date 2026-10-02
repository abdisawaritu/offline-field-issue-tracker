// server/src/services/historyService.js
// Append-only audit log

const { pool } = require("../config/db");
const { generateUuid } = require("../utils/uuid");

/**
 * Insert a single history entry.
 */
async function logEvent({
  reportId,
  eventType,
  fromStatus = null,
  toStatus = null,
  actor,
  details = null,
  connection = null,
}) {
  const conn = connection || (await pool.getConnection());
  const ownsConnection = !connection;

  try {
    await conn.query(
      `INSERT INTO report_history (
        id, report_id, event_type, from_status, to_status, actor, details
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        generateUuid(),
        reportId,
        eventType,
        fromStatus,
        toStatus,
        actor,
        details ? JSON.stringify(details) : null,
      ],
    );
  } finally {
    if (ownsConnection) conn.release();
  }
}

/**
 * Fetch full history for a report (chronological).
 */
async function getHistory(reportId) {
  const [rows] = await pool.query(
    `SELECT id, report_id, event_type, from_status, to_status, actor, details, created_at
     FROM report_history
     WHERE report_id = ?
     ORDER BY created_at ASC, id ASC`,
    [reportId],
  );

  return rows.map((r) => ({
    id: r.id,
    reportId: r.report_id,
    eventType: r.event_type,
    fromStatus: r.from_status,
    toStatus: r.to_status,
    actor: r.actor,
    details: r.details
      ? typeof r.details === "string"
        ? JSON.parse(r.details)
        : r.details
      : null,
    createdAt: r.created_at,
  }));
}

/**
 * Bulk-insert history events that came from the client during sync.
 * Skips events that already exist (by id).
 */
async function logClientHistory(reportId, events, connection) {
  if (!Array.isArray(events) || events.length === 0) return;

  for (const ev of events) {
    // Check existence by id (idempotent — retries won't duplicate)
    const [existing] = await connection.query(
      "SELECT id FROM report_history WHERE id = ? LIMIT 1",
      [ev.id],
    );
    if (existing.length > 0) continue;

    await connection.query(
      `INSERT INTO report_history (
        id, report_id, event_type, from_status, to_status, actor, details
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        ev.id,
        reportId,
        ev.eventType,
        ev.fromStatus ?? null,
        ev.toStatus ?? null,
        ev.actor,
        ev.details ? JSON.stringify(ev.details) : null,
      ],
    );
  }
}

module.exports = {
  logEvent,
  getHistory,
  logClientHistory,
};
