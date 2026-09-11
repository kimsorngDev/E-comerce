import express from "express";
import * as orderController from "../controllers/order.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import requireAdmin from "../middlewares/admin.middleware.js";
import { validateOrderStatus } from "../middlewares/validate.middleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order placement and management
 */

// Admin order routes
router.get("/admin/stats", authMiddleware, requireAdmin, orderController.getDashboardStats);
router.get("/admin/all", authMiddleware, requireAdmin, orderController.getAllOrders);

// Order status update (Admin)
router.patch("/:id/status", authMiddleware, requireAdmin, validateOrderStatus, orderController.updateOrderStatus);
router.put("/:id/status", authMiddleware, requireAdmin, validateOrderStatus, orderController.updateOrderStatus);

// Checkout & Customer order routes
router.post("/", authMiddleware, orderController.createOrder);

router.get("/", authMiddleware, (req, res, next) => {
  if (req.user?.role === "ADMIN") {
    return orderController.getAllOrders(req, res, next);
  }
  return orderController.getUserOrders(req, res, next);
});

router.get("/:id", authMiddleware, orderController.getOrderById);

export default router;
