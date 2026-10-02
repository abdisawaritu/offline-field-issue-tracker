// server/src/middleware/errorHandler.js
// Centralized error handling — all errors funnel through here

const { ZodError } = require("zod");

function errorHandler(err, req, res, next) {
  // Log for debugging
  console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err.message);

  // ---- Zod validation errors ----
  // Zod v4 uses `issues`; Zod v3 uses `errors`. Support both.
  const isZodError =
    err instanceof ZodError ||
    err?.name === "ZodError" ||
    (Array.isArray(err?.issues) && err?.name === "ZodError");

  if (isZodError) {
    const issues = err.issues || err.errors || [];
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        details: issues.map((e) => ({
          field: Array.isArray(e.path)
            ? e.path.join(".")
            : String(e.path || ""),
          message: e.message,
        })),
      },
      meta: {
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      },
    });
  }

  // ---- Custom application errors ----
  const statusCode = err.statusCode || 500;
  const code = err.code || "INTERNAL_ERROR";
  const message = err.message || "Something went wrong";

  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(err.details ? { details: err.details } : {}),
    },
    meta: {
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    },
  });
}

/**
 * Helper to create an application error with a status code.
 */
function appError(statusCode, code, message, details) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  if (details) err.details = details;
  return err;
}

module.exports = {
  errorHandler,
  appError,
};
