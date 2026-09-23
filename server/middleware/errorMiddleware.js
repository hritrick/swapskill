/**
 * Central error-handling middleware.
 * Catches anything thrown (or passed to next()) in routes/controllers.
 *
 * ApiError instances carry their own statusCode + errors array.
 * Plain Error instances fall back to res.statusCode (set by the controller
 * before throwing) or 500 if that was never set.
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    // Per-field validation errors (populated by validate middleware via ApiError)
    errors: err.errors && err.errors.length > 0 ? err.errors : undefined,
    // Stack trace in dev only — never in production
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

module.exports = { errorHandler };
