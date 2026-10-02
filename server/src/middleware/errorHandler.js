// server/src/middleware/errorHandler.js
// Centralized error handling — all errors funnel through here

const { ZodError } = require("zod");

function errorHandler(err, req, res, next) {
  // Log for debugging
  console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err.message);

  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        details: err.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      },
      meta: {
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
      },
    });
  }

  // Custom application errors (thrown with .statusCode)
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
 * Usage: throw appError(400, "VALIDATION_ERROR", "Invalid input");
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
