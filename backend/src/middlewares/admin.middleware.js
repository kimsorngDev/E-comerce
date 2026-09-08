import authMiddleware from "./auth.middleware.js";

/**
 * Middleware that ensures the authenticated user has the ADMIN role.
 * Must be used AFTER authMiddleware (requires req.user to be populated).
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    });
  }
  next();
};

export default requireAdmin;
