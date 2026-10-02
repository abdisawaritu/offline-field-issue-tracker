// server/src/routes/reports.js
// Routes for /api/v1/reports

const express = require("express");
const controller = require("../controllers/reportsController");
const { validateBody } = require("../middleware/validate");
const {
  syncReportSchema,
  updateStatusSchema,
  reopenSchema,
} = require("../validators/reportValidators");

const router = express.Router();

// POST /api/v1/reports/sync — idempotent create/update
router.post("/sync", validateBody(syncReportSchema), controller.sync);

// GET /api/v1/reports — list with filters
router.get("/", controller.list);

// GET /api/v1/reports/:id — detail with history
router.get("/:id", controller.detail);

// GET /api/v1/reports/:id/history — full audit log
router.get("/:id/history", controller.history);

// PATCH /api/v1/reports/:id/status — update status
router.patch(
  "/:id/status",
  validateBody(updateStatusSchema),
  controller.updateStatus,
);

// POST /api/v1/reports/:id/reopen — reopen resolved/rejected
router.post("/:id/reopen", validateBody(reopenSchema), controller.reopen);

// DELETE /api/v1/reports/:id — soft delete
router.delete("/:id", controller.remove);

module.exports = router;
