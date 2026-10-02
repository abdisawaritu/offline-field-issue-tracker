// server/src/routes/health.js
// GET /api/v1/health — connectivity + DB status check

const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { checkDatabaseHealth } = require("../config/db");

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const db = await checkDatabaseHealth();

    const status = db.ok ? 200 : 503;

    res.status(status).json({
      success: db.ok,
      data: {
        status: db.ok ? "ok" : "degraded",
        database: db.ok ? "connected" : "disconnected",
        ...(db.ok ? {} : { error: db.error }),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  }),
);

module.exports = router;
