/**
 * Custom application error class.
 * Allows throwing structured errors with an HTTP status code from anywhere.
 *
 * Usage:
 *   throw new AppError("Product not found", 404);
 *   throw new AppError("Insufficient stock", 400);
 */
class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}

export default AppError;
