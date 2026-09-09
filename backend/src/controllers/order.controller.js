import * as orderService from "../service/order.service.js";

/**
 * Create a new order (Checkout)
 */
const createOrder = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { shippingInfo } = req.body;

    const order = await orderService.createOrder(userId, { shippingInfo });
    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
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
 * Get all orders (Admin)
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
 * Update order status (Admin)
 */
const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    const order = await orderService.updateOrderStatus(orderId, status);
    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
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
