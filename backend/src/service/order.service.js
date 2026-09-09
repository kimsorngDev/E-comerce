import prisma from "../config/database.js";

/**
 * Formats an order object for clean API responses.
 * Ensures totalAmount and item prices are numbers.
 */
const formatOrder = (order, shippingInfo = null) => {
  if (!order) return null;

  return {
    id: order.id,
    userId: order.userId,
    status: order.status,
    totalAmount: Number(order.totalAmount),
    items: (order.items || []).map((item) => ({
      id: item.id,
      quantity: item.quantity,
      price: Number(item.price), // Snapshot price at purchase time
      product: item.product
        ? {
            id: item.product.id,
            name: item.product.name,
            description: item.product.description,
            price: Number(item.product.price),
            imageUrl: item.product.imageUrl,
          }
        : null,
    })),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    ...(shippingInfo ? { shippingInfo } : {}),
  };
};

/**
 * Create a new order for a user based on their current cart items.
 * @param {number|string} userId
 * @param {Object} orderData
 * @param {Object} orderData.shippingInfo - { name, address, city, zip, phone }
 * @returns {Promise<Object>} Created order object
 */
const createOrder = async (userId, { shippingInfo } = {}) => {
  const parsedUserId = parseInt(userId, 10);
  if (isNaN(parsedUserId)) {
    throw new Error("Invalid user ID");
  }

  // 1. Get user cart with items and products
  const cart = await prisma.cart.findUnique({
    where: { userId: parsedUserId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!cart || !cart.items || cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  // 2. Validate stock and calculate total
  let totalAmount = 0;
  for (const item of cart.items) {
    if (!item.product || !item.product.isActive) {
      throw new Error(`Product "${item.product ? item.product.name : 'Unknown'}" is no longer available`);
    }
    if (item.product.stock < item.quantity) {
      throw new Error(`Insufficient stock for product "${item.product.name}". Available: ${item.product.stock}`);
    }
    totalAmount += Number(item.product.price) * item.quantity;
  }

  totalAmount = Math.round(totalAmount * 100) / 100;

  // 3. Perform order creation in a database transaction
  const order = await prisma.$transaction(async (tx) => {
    // Deduct product stock
    for (const item of cart.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    // Create the Order
    const newOrder = await tx.order.create({
      data: {
        userId: parsedUserId,
        status: "PENDING",
        totalAmount,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: Number(item.product.price),
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Clear cart items
    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return newOrder;
  });

  return formatOrder(order, shippingInfo);
};

/**
 * Get user's order history.
 * @param {number|string} userId
 * @returns {Promise<Array>}
 */
const getUserOrders = async (userId) => {
  const parsedUserId = parseInt(userId, 10);
  if (isNaN(parsedUserId)) {
    throw new Error("Invalid user ID");
  }

  const orders = await prisma.order.findMany({
    where: { userId: parsedUserId },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  return orders.map(formatOrder);
};

// Aliasing getOrders to getUserOrders for backward compatibility if needed, but let's just use getUserOrders.
const getOrders = getUserOrders;

/**
 * Get order details by ID for a user.
 * @param {number|string} userId
 * @param {number|string} orderId
 * @returns {Promise<Object>}
 */
const getOrderById = async (userId, orderId) => {
  const parsedUserId = parseInt(userId, 10);
  const parsedOrderId = parseInt(orderId, 10);

  if (isNaN(parsedUserId) || isNaN(parsedOrderId)) {
    throw new Error("Invalid ID parameters");
  }

  const order = await prisma.order.findFirst({
    where: {
      id: parsedOrderId,
      userId: parsedUserId,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  return formatOrder(order);
};

// Valid status transitions
const STATUS_TRANSITIONS = {
  PENDING:    ["CONFIRMED", "CANCELLED"],
  CONFIRMED:  ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED:    ["DELIVERED"],
  DELIVERED:  [],
  CANCELLED:  [],
};

/**
 * Get all orders in system (Admin)
 */
const getAllOrders = async () => {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      items: {
        include: { product: true },
      },
    },
  });

  return orders.map((o) => ({
    ...formatOrder(o),
    user: o.user,
  }));
};

/**
 * Update order status (Admin)
 */
const updateOrderStatus = async (orderId, status) => {
  const parsedOrderId = parseInt(orderId, 10);
  if (isNaN(parsedOrderId)) {
    throw new Error("Invalid order ID");
  }

  const validStatuses = Object.keys(STATUS_TRANSITIONS);
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
  }

  const updatedOrder = await prisma.order.update({
    where: { id: parsedOrderId },
    data: { status },
    include: { items: { include: { product: true } } },
  });

  return formatOrder(updatedOrder);
};

/**
 * Get basic dashboard stats (Admin)
 */
const getDashboardStats = async () => {
  const totalProducts = await prisma.product.count({ where: { isActive: true } });
  const totalOrders = await prisma.order.count();
  const totalUsers = await prisma.user.count();

  const totalRevenueResult = await prisma.order.aggregate({
    _sum: {
      totalAmount: true,
    },
  });
  const totalRevenue = Number(totalRevenueResult._sum.totalAmount || 0);

  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return {
    totalProducts,
    totalOrders,
    totalUsers,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      customer: o.user ? o.user.name || o.user.email : "Guest",
      status: o.status,
      totalAmount: Number(o.totalAmount),
      createdAt: o.createdAt,
    })),
  };
};

export {
  createOrder,
  getOrders,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getDashboardStats,
};
