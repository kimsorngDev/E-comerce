import prisma from "../config/database.js";

/**
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
  const parsedUserId = parseInt(userId, 10);
  if (isNaN(parsedUserId)) {
    throw new Error("Invalid user ID");
  }

  // 1. Check user exists
  const user = await prisma.user.findUnique({
    where: { id: parsedUserId },
  });
  if (!user) {
    throw new Error("User not found");
  }

  // 2. Fetch user's cart with items and products
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
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price, // Snapshots price at checkout
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

    // Clear cart items after successful checkout
    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

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
 * @param {number|string} userId
 * @param {number|string} orderId
 * @returns {Promise<Object>}
 */
const getOrderById = async (userId, orderId) => {
  const parsedUserId = parseInt(userId, 10);
  const parsedOrderId = parseInt(orderId, 10);

  if (isNaN(parsedUserId)) {
    throw new Error("Invalid user ID");
  }
  if (isNaN(parsedOrderId)) {
    throw new Error("Invalid order ID");
  }

  const order = await prisma.order.findUnique({
    where: { id: parsedOrderId },
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
      },
      items: {
        include: { product: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return orders.map((order) => ({
    ...formatOrder(order),
    user: order.user,
  }));
};

/**
 * Update the status of an order (Admin only).
 * Validates that the transition is legal.
 * @param {number|string} orderId
 * @param {string} newStatus
 * @returns {Promise<Object>}
 */
const updateOrderStatus = async (orderId, newStatus) => {
  const parsedOrderId = parseInt(orderId, 10);
  if (isNaN(parsedOrderId)) {
    throw new Error("Invalid order ID");
  }

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
};
