/**
 * Centralized error-handling middleware.
 * Must be registered LAST in app.js (after all routes).
 *
 * Catches errors forwarded via next(err) from any controller.
 * Differentiates between known AppErrors and unexpected server errors.
 */
const errorMiddleware = (err, req, res, next) => {
  // Log unexpected errors in detail; skip noisy AppErrors in production
  if (!err.statusCode || err.statusCode >= 500) {
    console.error(`[ERROR] ${req.method} ${req.originalUrl}`, err);
  }

  // Prisma unique constraint violation (e.g. duplicate email / category name)
  if (err.code === "P2002") {
    const field = err.meta?.target?.join(", ") || "field";
    return res.status(409).json({
      success: false,
      message: `A record with this ${field} already exists.`,
    });
  }

  // Prisma record not found
  if (err.code === "P2025") {
    return res.status(404).json({
      success: false,
      message: err.meta?.cause || "Record not found.",
    });
  }

  // Known application errors (thrown via AppError or plain Error with statusCode)
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  const response = {
    success: false,
    message,
  };

  if (err.errors && Array.isArray(err.errors)) {
    response.errors = err.errors;
  }

  return res.status(statusCode).json(response);
};

export default errorMiddleware;
