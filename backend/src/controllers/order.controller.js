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
};
