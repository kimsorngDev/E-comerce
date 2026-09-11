import prisma from "../config/database.js";

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

    // Clear cart items
    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return newOrder;
  });

  return {
    id: order.id,
    userId: order.userId,
    status: order.status,
    totalAmount: Number(order.totalAmount),
    createdAt: order.createdAt,
    items: order.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      price: Number(item.price),
      product: {
        id: item.product.id,
        name: item.product.name,
        imageUrl: item.product.imageUrl,
      },
    })),
    shippingInfo: shippingInfo || null,
  };
};

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

  return {
    id: order.id,
    userId: order.userId,
    status: order.status,
    totalAmount: Number(order.totalAmount),
    createdAt: order.createdAt,
    items: order.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      price: Number(item.price),
      product: {
        id: item.product.id,
        name: item.product.name,
        imageUrl: item.product.imageUrl,
      },
    })),
  };
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

  return orders.map((order) => ({
    id: order.id,
    status: order.status,
    totalAmount: Number(order.totalAmount),
    createdAt: order.createdAt,
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
  }));
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
    id: o.id,
    userId: o.userId,
    user: o.user,
    status: o.status,
    totalAmount: Number(o.totalAmount),
    createdAt: o.createdAt,
    itemCount: o.items.reduce((sum, i) => sum + i.quantity, 0),
    items: o.items.map((i) => ({
      id: i.id,
      quantity: i.quantity,
      price: Number(i.price),
      product: i.product ? { id: i.product.id, name: i.product.name, imageUrl: i.product.imageUrl } : null,
    })),
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

  const validStatuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
  }

  const updatedOrder = await prisma.order.update({
    where: { id: parsedOrderId },
    data: { status },
  });

  return {
    id: updatedOrder.id,
    status: updatedOrder.status,
    updatedAt: updatedOrder.updatedAt,
  };
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
  getOrderById,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  getDashboardStats,
};
