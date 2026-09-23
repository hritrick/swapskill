/**
 * ApiError — typed application error.
 * Throw this anywhere in a controller and errorMiddleware will format it.
 *
 * Usage:
 *   throw new ApiError(400, 'Email already in use');
 *   throw new ApiError(404, 'Skill not found');
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode  HTTP status code (4xx / 5xx)
   * @param {string} message     Human-readable error message
   * @param {Array}  [errors]    Optional field-level validation errors [{field, message}]
   */
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = 'ApiError';
    // Capture stack trace (V8 engines only — no-op elsewhere)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

module.exports = ApiError;
