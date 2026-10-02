// server/src/controllers/reportsController.js
// HTTP handlers for report endpoints

const asyncHandler = require("../utils/asyncHandler");
const reportService = require("../services/reportService");
const { logEvent } = require("../services/historyService");
const { pool } = require("../config/db");

// ---------- POST /api/v1/reports/sync ----------

const sync = asyncHandler(async (req, res) => {
  const payload = req.validatedBody;

  const result = await reportService.syncReport(payload);

  const statusCode = result.duplicate ? 200 : 201;

  // Log sync attempt (observability)
  await pool.query(
    `INSERT INTO sync_log (client_id, report_id, event, http_status, message)
     VALUES (?, ?, ?, ?, ?)`,
    [
      payload.clientId,
      result.report.id,
      result.duplicate ? "DUPLICATE" : "CREATED",
      statusCode,
      result.updated ? "Updated" : "Created",
    ],
  );

  res.status(statusCode).json({
    success: true,
    data: {
      id: result.report.id,
      clientId: result.report.clientId,
      syncState: "SYNCHRONIZED",
      syncVersion: result.report.syncVersion,
      duplicate: result.duplicate,
      updated: result.updated,
      createdAt: result.report.createdAt,
      updatedAt: result.report.updatedAt,
    },
    meta: { timestamp: new Date().toISOString() },
  });
});

// ---------- GET /api/v1/reports ----------

const list = asyncHandler(async (req, res) => {
  const filters = {
    status: req.query.status,
    priority: req.query.priority,
    category: req.query.category,
    includeDeleted: req.query.includeDeleted,
    sort: req.query.sort,
  };

  const reports = await reportService.listReports(filters);

  res.json({
    success: true,
    data: reports,
    meta: {
      count: reports.length,
      timestamp: new Date().toISOString(),
    },
  });
});

// ---------- GET /api/v1/reports/:id ----------

const detail = asyncHandler(async (req, res) => {
  const report = await reportService.getReportById(req.params.id);
  res.json({
    success: true,
    data: report,
    meta: { timestamp: new Date().toISOString() },
  });
});

// ---------- PATCH /api/v1/reports/:id/status ----------

const updateStatus = asyncHandler(async (req, res) => {
  const { toStatus, actor, assignedTo, reason } = req.validatedBody;

  const updated = await reportService.updateStatus(req.params.id, {
    toStatus,
    actor,
    assignedTo,
    reason,
  });

  res.json({
    success: true,
    data: updated,
    meta: { timestamp: new Date().toISOString() },
  });
});

// ---------- POST /api/v1/reports/:id/reopen ----------

const reopen = asyncHandler(async (req, res) => {
  const { actor, reason } = req.validatedBody;

  const updated = await reportService.reopenReport(req.params.id, {
    actor,
    reason,
  });

  res.json({
    success: true,
    data: updated,
    meta: { timestamp: new Date().toISOString() },
  });
});

// ---------- GET /api/v1/reports/:id/history ----------

const history = asyncHandler(async (req, res) => {
  const { getHistory } = require("../services/historyService");
  const events = await getHistory(req.params.id);

  res.json({
    success: true,
    data: events,
    meta: { count: events.length, timestamp: new Date().toISOString() },
  });
});

// ---------- DELETE /api/v1/reports/:id ----------

const remove = asyncHandler(async (req, res) => {
  const result = await reportService.softDeleteReport(req.params.id);
  res.json({
    success: true,
    data: result,
    meta: { timestamp: new Date().toISOString() },
  });
});

module.exports = {
  sync,
  list,
  detail,
  updateStatus,
  reopen,
  history,
  remove,
};
