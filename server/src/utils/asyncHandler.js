// server/src/utils/asyncHandler.js
// Wraps async route handlers to forward errors to Express error middleware

module.exports = function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
