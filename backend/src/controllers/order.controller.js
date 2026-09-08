import * as orderService from "../service/order.service.js";

/**
<<<<<<< HEAD
 * Create a new order from current cart (Checkout)
=======
 * Create a new order (Checkout)
>>>>>>> 8b2c505 (update week6)
 */
const createOrder = async (req, res) => {
  try {
    const userId = req.user.userId;
<<<<<<< HEAD
    const order = await orderService.createOrder(userId);
    return res.status(201).json({
      success: true,
      message: "Order created successfully",
=======
    const { shippingInfo } = req.body;

    const order = await orderService.createOrder(userId, { shippingInfo });
    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
>>>>>>> 8b2c505 (update week6)
      order,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
<<<<<<< HEAD
 * Get all orders for current user
 */
const getOrders = async (req, res) => {
  try {
    const userId = req.user.userId;
    const orders = await orderService.getOrders(userId);
=======
 * Get order details by ID
 */
const getOrderById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const orderId = req.params.id;

    const order = await orderService.getOrderById(userId, orderId);
    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get user order history
 */
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.userId;
    const orders = await orderService.getUserOrders(userId);
>>>>>>> 8b2c505 (update week6)
    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
<<<<<<< HEAD
 * Get single order details by ID
 */
const getOrderById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const orderId = req.params.id;
    const order = await orderService.getOrderById(userId, orderId);
    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    const statusCode = error.message === "Order not found" ? 404 :
                       error.message.includes("Unauthorized") ? 403 : 400;
    return res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  createOrder,
  getOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};

/**
 * Get ALL orders across all users (Admin only)
=======
 * Get all orders (Admin)
>>>>>>> 8b2c505 (update week6)
 */
const getAllOrders = async (req, res) => {
  try {
    const orders = await orderService.getAllOrders();
    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
<<<<<<< HEAD
 * Update an order's status (Admin only)
=======
 * Update order status (Admin)
>>>>>>> 8b2c505 (update week6)
 */
const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

<<<<<<< HEAD
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "status field is required",
      });
    }

    const order = await orderService.updateOrderStatus(orderId, status);
    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (error) {
    const statusCode = error.message === "Order not found" ? 404 : 400;
    return res.status(statusCode).json({
=======
    const order = await orderService.updateOrderStatus(orderId, status);
    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    return res.status(400).json({
>>>>>>> 8b2c505 (update week6)
      success: false,
      message: error.message,
    });
  }
};
<<<<<<< HEAD
=======

/**
 * Get dashboard stats (Admin)
 */
const getDashboardStats = async (req, res) => {
  try {
    const stats = await orderService.getDashboardStats();
    return res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  createOrder,
  getOrderById,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  getDashboardStats,
};
>>>>>>> 8b2c505 (update week6)
