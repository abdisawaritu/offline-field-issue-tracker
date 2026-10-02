// server/src/services/reportService.js
// Business logic for reports

const { pool } = require("../config/db");
const { upsertReport } = require("./idempotencyService");
const { logEvent, logClientHistory, getHistory } = require("./historyService");
const { appError } = require("../middleware/errorHandler");
const {
  canTransition,
  canReopen,
  getReopenTarget,
  getAllowedTransitions,
} = require("../utils/stateMachine");

// ---------- Helpers ----------

function mapRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    clientId: row.client_id,
    category: row.category,
    description: row.description,
    location: row.location,
    latitude: row.latitude,
    longitude: row.longitude,
    priority: row.priority,
    status: row.status,
    createdBy: row.created_by,
    assignedTo: row.assigned_to,
    reportedAt: row.reported_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    clientUpdatedAt: row.client_updated_at,
    syncVersion: row.sync_version,
    deleted: Boolean(row.deleted),
  };
}

// ---------- Sync (create or update) ----------

async function syncReport(payload) {
  const result = await upsertReport(payload);

  // Log history on the server side
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    if (!result.duplicate) {
      await logEvent({
        reportId: result.report.id,
        eventType: "CREATED",
        toStatus: result.report.status,
        actor: payload.createdBy,
        details: { clientId: payload.clientId },
        connection,
      });
    } else if (result.updated) {
      await logEvent({
        reportId: result.report.id,
        eventType: "UPDATED",
        toStatus: result.report.status,
        actor: payload.createdBy,
        details: { clientId: payload.clientId },
        connection,
      });
    }

    // Persist client-side history events (idempotent)
    if (payload.history && payload.history.length > 0) {
      await logClientHistory(result.report.id, payload.history, connection);
    }

    await logEvent({
      reportId: result.report.id,
      eventType: "SYNC_SUCCEEDED",
      actor: "system",
      details: { duplicate: result.duplicate, updated: result.updated },
      connection,
    });

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }

  return {
    report: mapRow(result.report),
    duplicate: result.duplicate,
    updated: result.updated,
  };
}

// ---------- List ----------

async function listReports(filters = {}) {
  const where = ["deleted = FALSE"];
  const params = [];

  if (filters.status) {
    where.push("status = ?");
    params.push(filters.status);
  }
  if (filters.priority) {
    where.push("priority = ?");
    params.push(filters.priority);
  }
  if (filters.category) {
    where.push("category = ?");
    params.push(filters.category);
  }
  if (filters.includeDeleted === true || filters.includeDeleted === "true") {
    where[0] = "1 = 1";
  }

  const orderBy =
    filters.sort === "createdAt:asc"
      ? "created_at ASC"
      : filters.sort === "createdAt:desc"
        ? "created_at DESC"
        : `FIELD(priority, 'HIGH', 'MEDIUM', 'LOW'), created_at DESC`;

  const sql = `SELECT * FROM reports WHERE ${where.join(
    " AND ",
  )} ORDER BY ${orderBy}`;

  const [rows] = await pool.query(sql, params);
  return rows.map(mapRow);
}

// ---------- Detail ----------

async function getReportById(id) {
  const [rows] = await pool.query(
    "SELECT * FROM reports WHERE id = ? LIMIT 1",
    [id],
  );
  if (rows.length === 0) {
    throw appError(404, "NOT_FOUND", `Report ${id} not found`);
  }

  const report = mapRow(rows[0]);
  const history = await getHistory(id);

  return { ...report, history };
}

// ---------- Update status ----------

async function updateStatus(id, { toStatus, actor, assignedTo, reason }) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      "SELECT * FROM reports WHERE id = ? AND deleted = FALSE FOR UPDATE",
      [id],
    );
    if (rows.length === 0) {
      throw appError(404, "NOT_FOUND", `Report ${id} not found`);
    }

    const current = rows[0];

    if (!canTransition(current.status, toStatus)) {
      throw appError(
        400,
        "INVALID_TRANSITION",
        `Cannot transition from '${current.status}' to '${toStatus}'`,
        {
          from: current.status,
          to: toStatus,
          allowed: getAllowedTransitions(current.status),
        },
      );
    }

    await connection.query(
      `UPDATE reports SET
        status = ?,
        assigned_to = COALESCE(?, assigned_to),
        sync_version = sync_version + 1
      WHERE id = ?`,
      [toStatus, assignedTo ?? null, id],
    );

    await logEvent({
      reportId: id,
      eventType: toStatus === "ASSIGNED" ? "ASSIGNED" : "STATUS_CHANGED",
      fromStatus: current.status,
      toStatus,
      actor,
      details: { reason: reason ?? null },
      connection,
    });

    const [updatedRows] = await connection.query(
      "SELECT * FROM reports WHERE id = ? LIMIT 1",
      [id],
    );

    await connection.commit();
    return mapRow(updatedRows[0]);
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// ---------- Reopen ----------

async function reopenReport(id, { actor, reason }) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      "SELECT * FROM reports WHERE id = ? AND deleted = FALSE FOR UPDATE",
      [id],
    );
    if (rows.length === 0) {
      throw appError(404, "NOT_FOUND", `Report ${id} not found`);
    }

    const current = rows[0];

    if (!canReopen(current.status)) {
      throw appError(
        422,
        "UNPROCESSABLE",
        `Report in status '${current.status}' cannot be reopened`,
        { currentStatus: current.status },
      );
    }

    const targetStatus = getReopenTarget(current.status);

    await connection.query(
      "UPDATE reports SET status = ?, sync_version = sync_version + 1 WHERE id = ?",
      [targetStatus, id],
    );

    await logEvent({
      reportId: id,
      eventType: "REOPENED",
      fromStatus: current.status,
      toStatus: targetStatus,
      actor,
      details: { reason: reason ?? null },
      connection,
    });

    const [updatedRows] = await connection.query(
      "SELECT * FROM reports WHERE id = ? LIMIT 1",
      [id],
    );

    await connection.commit();
    return mapRow(updatedRows[0]);
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// ---------- Soft delete ----------

async function softDeleteReport(id) {
  const [rows] = await pool.query(
    "SELECT * FROM reports WHERE id = ? LIMIT 1",
    [id],
  );
  if (rows.length === 0) {
    throw appError(404, "NOT_FOUND", `Report ${id} not found`);
  }

  await pool.query(
    "UPDATE reports SET deleted = TRUE, sync_version = sync_version + 1 WHERE id = ?",
    [id],
  );

  return { id, deleted: true };
}

module.exports = {
  syncReport,
  listReports,
  getReportById,
  updateStatus,
  reopenReport,
  softDeleteReport,
};
