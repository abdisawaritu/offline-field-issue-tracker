// server/src/app.js
// Express application — middleware, routes, error handling

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const healthRoute = require("./routes/health");
const reportsRoute = require("./routes/reports");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

// ---------- Global middleware ----------
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// ---------- Routes ----------
app.use("/api/v1/health", healthRoute);
app.use("/api/v1/reports", reportsRoute);

// Legacy health (backward compatible)
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Offline Field Issue Tracker API is running",
  });
});

// ---------- 404 handler ----------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.originalUrl} not found`,
    },
    meta: { timestamp: new Date().toISOString() },
  });
});

// ---------- Error handler (MUST be last) ----------
app.use(errorHandler);

module.exports = app;
