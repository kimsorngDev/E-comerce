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
 *   description: Order placement and history (requires authentication)
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Checkout – create an order from the current cart
 *     description: |
 *       Converts the authenticated user's cart into an order.
 *       - Validates stock availability for all cart items.
 *       - Snapshots the unit price of each item at time of purchase.
 *       - Decrements product stock.
 *       - Clears the cart on success.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Order placed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Order created successfully
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Cart is empty, insufficient stock, or product unavailable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/", authMiddleware, orderController.createOrder);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get orders – own orders (CUSTOMER) or all orders (ADMIN)
 *     description: |
 *       - **CUSTOMER**: returns only their own orders.
 *       - **ADMIN**: returns all orders from all users, including user info.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders (newest first)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 orders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", authMiddleware, (req, res, next) => {
  // Admins see all orders; customers see only their own
  if (req.user.role === "ADMIN") {
    return orderController.getAllOrders(req, res, next);
  }
  return orderController.getOrders(req, res, next);
});

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get a single order by ID
 *     description: Returns full order details. Only the owner of the order (or Admin) can view it.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details with item price snapshots
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden – order belongs to another user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:id", authMiddleware, orderController.getOrderById);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   patch:
 *     summary: Update order status (Admin only)
 *     description: |
 *       Updates the order status with transition validation.
 *       Valid transitions:
 *       - PENDING → CONFIRMED, CANCELLED
 *       - CONFIRMED → PROCESSING, CANCELLED
 *       - PROCESSING → SHIPPED, CANCELLED
 *       - SHIPPED → DELIVERED
 *       - DELIVERED → (terminal)
 *       - CANCELLED → (terminal)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED]
 *                 example: CONFIRMED
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Order status updated to CONFIRMED
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid status or illegal transition
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden – Admin only
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch("/:id/status", authMiddleware, requireAdmin, validateOrderStatus, orderController.updateOrderStatus);
router.put("/:id/status", authMiddleware, requireAdmin, validateOrderStatus, orderController.updateOrderStatus);

export default router;
