import * as orderService from "../service/order.service.js";

/**
 * Create a new order from current cart (Checkout)
 */
const createOrder = async (req, res) => {
  try {
    const userId = req.user.userId;
    const order = await orderService.createOrder(userId);
    return res.status(201).json({
      success: true,
      message: "Order created successfully",
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
 * Get all orders for current user
 */
const getOrders = async (req, res) => {
  try {
    const userId = req.user.userId;
    const orders = await orderService.getOrders(userId);
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
 * Update an order's status (Admin only)
 */
const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

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
      success: false,
      message: error.message,
    });
  }
};
