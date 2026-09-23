const ApiError = require('../utils/ApiError');

/**
 * Zod validation middleware factory.
 *
 * Usage:
 *   router.post('/register', validate(registerSchema), registerUser);
 *
 * On failure: throws ApiError(400) with per-field errors array so the
 * error handler can return a consistent { success: false, errors } shape.
 */
const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return next(new ApiError(400, 'Validation failed', errors));
  }
  // Attach the parsed (and type-coerced) data so controllers don't re-parse
  req.body = result.data;
  return next();
};

module.exports = validate;
