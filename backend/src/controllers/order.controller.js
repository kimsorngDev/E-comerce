import * as orderService from "../service/order.service.js";

const createOrder = async (req, res, next) => {
  try {
    const { shippingInfo } = req.body || {};
    const order = await orderService.createOrder(req.user.userId, { shippingInfo });
    return res.status(201).json({ success: true, message: "Order created successfully", order });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 400;
    next(err);
  }
};

const getUserOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getUserOrders(req.user.userId);
    return res.status(200).json({ success: true, orders });
  } catch (err) {
    next(err);
  }
};

const getOrders = getUserOrders;

const getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.user.userId, req.params.id);
    return res.status(200).json({ success: true, order });
  } catch (err) {
    if (err.message === "Order not found") err.statusCode = 404;
    if (err.message?.includes("Unauthorized")) err.statusCode = 403;
    next(err);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getAllOrders();
    return res.status(200).json({ success: true, orders });
  } catch (err) {
    next(err);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
    return res.status(200).json({
      success: true,
      message: `Order status updated to ${req.body.status}`,
      order,
    });
  } catch (err) {
    if (err.message === "Order not found") err.statusCode = 404;
    if (err.message?.startsWith("Cannot transition")) err.statusCode = 400;
    if (err.message?.startsWith("Invalid status")) err.statusCode = 400;
    next(err);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await orderService.getDashboardStats();
    return res.status(200).json({ success: true, stats });
  } catch (err) {
    next(err);
  }
};

export {
  createOrder,
  getUserOrders,
  getOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getDashboardStats,
};
