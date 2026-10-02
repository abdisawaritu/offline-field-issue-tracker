// server/src/middleware/validate.js
// Validates req.body against a Zod schema

function validateBody(schema) {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req.body);
      req.validatedBody = parsed;
      next();
    } catch (err) {
      next(err); // ZodError → errorHandler returns 400
    }
  };
}

module.exports = { validateBody };
