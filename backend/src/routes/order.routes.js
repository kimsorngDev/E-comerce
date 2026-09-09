import express from "express";
import * as orderController from "../controllers/order.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// Apply authMiddleware to protect all order routes
router.get("/admin/stats", authMiddleware, orderController.getDashboardStats);
router.get("/admin/all", authMiddleware, orderController.getAllOrders);
router.put("/:id/status", authMiddleware, orderController.updateOrderStatus);

router.post("/", authMiddleware, orderController.createOrder);
router.get("/", authMiddleware, orderController.getUserOrders);
router.get("/:id", authMiddleware, orderController.getOrderById);

export default router;
