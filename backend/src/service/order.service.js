import prisma from "../config/database.js";

/**
<<<<<<< HEAD
 * Formats an order object for clean API responses.
 * Ensures totalAmount and item prices are numbers.
 */
const formatOrder = (order) => {
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
  };
};

/**
 * Create an order from the user's current cart.
 * Clears the cart and snapshot prices upon success.
 * @param {number|string} userId
 * @returns {Promise<Object>}
 */
const createOrder = async (userId) => {
=======
 * Create a new order for a user based on their current cart items.
 * @param {number|string} userId
 * @param {Object} orderData
 * @param {Object} orderData.shippingInfo - { name, address, city, zip, phone }
 * @returns {Promise<Object>} Created order object
 */
const createOrder = async (userId, { shippingInfo } = {}) => {
>>>>>>> 8b2c505 (update week6)
  const parsedUserId = parseInt(userId, 10);
  if (isNaN(parsedUserId)) {
    throw new Error("Invalid user ID");
  }

<<<<<<< HEAD
  // 1. Check user exists
  const user = await prisma.user.findUnique({
    where: { id: parsedUserId },
  });
  if (!user) {
    throw new Error("User not found");
  }

  // 2. Fetch user's cart with items and products
=======
  // 1. Get user cart with items and products
>>>>>>> 8b2c505 (update week6)
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

<<<<<<< HEAD
  // 3. Validate stock and product active status for all items
  for (const item of cart.items) {
    if (!item.product || !item.product.isActive) {
      throw new Error(`Product '${item.product ? item.product.name : item.productId}' is not available`);
    }
    if (item.product.stock < item.quantity) {
      throw new Error(`Insufficient stock for product '${item.product.name}'`);
    }
  }

  // 4. Calculate total amount
  const totalAmount = cart.items.reduce((sum, item) => {
    return sum + Number(item.product.price) * item.quantity;
  }, 0);

  const roundedTotal = Math.round(totalAmount * 100) / 100;

  // 5. Execute creation, stock reduction, and cart clearance in a transaction
  const createdOrder = await prisma.$transaction(async (tx) => {
    // Deduct stock for each product
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

    // Create Order with OrderItems (snapshotting item price)
    const order = await tx.order.create({
      data: {
        userId: parsedUserId,
        status: "PENDING",
        totalAmount: roundedTotal,
=======
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
>>>>>>> 8b2c505 (update week6)
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
<<<<<<< HEAD
            price: item.product.price, // Snapshots price at checkout
=======
            price: Number(item.product.price),
>>>>>>> 8b2c505 (update week6)
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

<<<<<<< HEAD
    // Clear cart items after successful checkout
=======
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
>>>>>>> 8b2c505 (update week6)
    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

<<<<<<< HEAD
    return order;
  });

  return formatOrder(createdOrder);
};

/**
 * Get all orders for a specific user.
 * @param {number|string} userId
 * @returns {Promise<Array<Object>>}
 */
const getOrders = async (userId) => {
  const parsedUserId = parseInt(userId, 10);
  if (isNaN(parsedUserId)) {
    throw new Error("Invalid user ID");
  }

  const orders = await prisma.order.findMany({
    where: { userId: parsedUserId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return orders.map(formatOrder);
};

/**
 * Get a specific order by ID for a user.
=======
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
>>>>>>> 8b2c505 (update week6)
 * @param {number|string} userId
 * @param {number|string} orderId
 * @returns {Promise<Object>}
 */
const getOrderById = async (userId, orderId) => {
  const parsedUserId = parseInt(userId, 10);
  const parsedOrderId = parseInt(orderId, 10);

<<<<<<< HEAD
  if (isNaN(parsedUserId)) {
    throw new Error("Invalid user ID");
  }
  if (isNaN(parsedOrderId)) {
    throw new Error("Invalid order ID");
  }

  const order = await prisma.order.findUnique({
    where: { id: parsedOrderId },
=======
  if (isNaN(parsedUserId) || isNaN(parsedOrderId)) {
    throw new Error("Invalid ID parameters");
  }

  const order = await prisma.order.findFirst({
    where: {
      id: parsedOrderId,
      userId: parsedUserId,
    },
>>>>>>> 8b2c505 (update week6)
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

<<<<<<< HEAD
  if (order.userId !== parsedUserId) {
    throw new Error("Unauthorized access to this order");
  }

  return formatOrder(order);
};

// Valid status transitions — prevents illegal jumps (e.g. DELIVERED → PENDING)
const STATUS_TRANSITIONS = {
  PENDING:    ["CONFIRMED", "CANCELLED"],
  CONFIRMED:  ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED:    ["DELIVERED"],
  DELIVERED:  [],
  CANCELLED:  [],
};

/**
 * Get ALL orders across all users (Admin only).
 * @returns {Promise<Array<Object>>}
 */
const getAllOrders = async () => {
  const orders = await prisma.order.findMany({
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true },
=======
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
>>>>>>> 8b2c505 (update week6)
      },
      items: {
        include: { product: true },
      },
    },
<<<<<<< HEAD
    orderBy: { createdAt: "desc" },
  });

  return orders.map((order) => ({
    ...formatOrder(order),
    user: order.user,
=======
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
>>>>>>> 8b2c505 (update week6)
  }));
};

/**
<<<<<<< HEAD
 * Update the status of an order (Admin only).
 * Validates that the transition is legal.
 * @param {number|string} orderId
 * @param {string} newStatus
 * @returns {Promise<Object>}
 */
const updateOrderStatus = async (orderId, newStatus) => {
=======
 * Update order status (Admin)
 */
const updateOrderStatus = async (orderId, status) => {
>>>>>>> 8b2c505 (update week6)
  const parsedOrderId = parseInt(orderId, 10);
  if (isNaN(parsedOrderId)) {
    throw new Error("Invalid order ID");
  }

<<<<<<< HEAD
  const validStatuses = Object.keys(STATUS_TRANSITIONS);
  if (!validStatuses.includes(newStatus)) {
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
  }

  const order = await prisma.order.findUnique({
    where: { id: parsedOrderId },
    include: { items: { include: { product: true } } },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  const allowed = STATUS_TRANSITIONS[order.status];
  if (!allowed.includes(newStatus)) {
    throw new Error(
      `Cannot transition order from '${order.status}' to '${newStatus}'. ` +
      (allowed.length ? `Allowed: ${allowed.join(", ")}` : "No further transitions allowed.")
    );
  }

  const updated = await prisma.order.update({
    where: { id: parsedOrderId },
    data: { status: newStatus },
    include: { items: { include: { product: true } } },
  });

  return formatOrder(updated);
};


export {
  createOrder,
  getOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
=======
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
>>>>>>> 8b2c505 (update week6)
};
