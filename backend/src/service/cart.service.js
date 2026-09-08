import prisma from "../config/database.js";

/**
 * Formats the cart object to match the required client structure:
 * {
 *   id: number,
 *   items: Array<{ id, quantity, product: { id, name, price } }>,
 *   total: number
 * }
 */
const formatCart = (cart) => {
  if (!cart) return null;

  const items = (cart.items || []).map((item) => {
    const productPrice = item.product ? Number(item.product.price) : 0;
    return {
      id: item.id,
      quantity: item.quantity,
      product: item.product
        ? {
            id: item.product.id,
            name: item.product.name,
            price: productPrice,
            imageUrl: item.product.imageUrl || item.product.image || null,
          }
        : null,
    };
  });

  const total = items.reduce((sum, item) => {
    if (item.product) {
      return sum + item.product.price * item.quantity;
    }
    return sum;
  }, 0);

  return {
    id: cart.id,
    items,
    total: Math.round(total * 100) / 100, // round to 2 decimal places
  };
};

/**
 * Get or create a cart for a user, including cart items and products.
 * @param {number|string} userId
 * @returns {Promise<Object>}
 */
const getCart = async (userId) => {
  const parsedUserId = parseInt(userId, 10);
  if (isNaN(parsedUserId)) {
    throw new Error("Invalid user ID");
  }

  // Find user to verify user exists
  const user = await prisma.user.findUnique({
    where: { id: parsedUserId },
  });
  if (!user) {
    throw new Error("User not found");
  }

  // Find or create cart
  let cart = await prisma.cart.findUnique({
    where: { userId: parsedUserId },
    include: {
      items: {
        include: {
          product: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId: parsedUserId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });
  }

  return formatCart(cart);
};

/**
 * Add an item to the user's cart.
 * If the item already exists, increase its quantity.
 * @param {number|string} userId
 * @param {Object} itemData
 * @param {number|string} itemData.productId
 * @param {number} [itemData.quantity=1]
 * @returns {Promise<Object>}
 */
const addToCart = async (userId, { productId, quantity = 1 }) => {
  const parsedUserId = parseInt(userId, 10);
  const parsedProductId = parseInt(productId, 10);
  const parsedQuantity = parseInt(quantity, 10);

  if (isNaN(parsedUserId)) {
    throw new Error("Invalid user ID");
  }
  if (isNaN(parsedProductId)) {
    throw new Error("Invalid product ID");
  }
  if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
    throw new Error("Quantity must be a positive integer");
  }

  // 1. Verify product exists, is active, and check stock
  const product = await prisma.product.findUnique({
    where: { id: parsedProductId },
  });

  if (!product) {
    throw new Error("Product not found");
  }
  if (!product.isActive) {
    throw new Error("Product is inactive");
  }

  // 2. Get user's cart
  const cart = await getCart(parsedUserId);

  // 3. Check if the product is already in the cart
  const existingCartItem = cart.items.find(
    (item) => item.product && item.product.id === parsedProductId
  );

  const newQuantity = (existingCartItem ? existingCartItem.quantity : 0) + parsedQuantity;

  if (product.stock < newQuantity) {
    throw new Error("Insufficient stock");
  }

  // 4. Update existing or create new cart item
  if (existingCartItem) {
    await prisma.cartItem.update({
      where: { id: existingCartItem.id },
      data: { quantity: newQuantity },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: parsedProductId,
        quantity: parsedQuantity,
      },
    });
  }

  // Return the updated cart
  return await getCart(parsedUserId);
};

/**
 * Update the quantity of a specific cart item.
 * @param {number|string} userId
 * @param {number|string} productIdOrItemId
 * @param {Object} updateData
 * @param {number} updateData.quantity
 * @returns {Promise<Object>}
 */
const updateCartItem = async (userId, productIdOrItemId, { quantity }) => {
  const parsedUserId = parseInt(userId, 10);
  const parsedId = parseInt(productIdOrItemId, 10);
  const parsedQuantity = parseInt(quantity, 10);

  if (isNaN(parsedUserId)) {
    throw new Error("Invalid user ID");
  }
  if (isNaN(parsedId)) {
    throw new Error("Invalid product or item ID");
  }
  if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
    throw new Error("Quantity must be a positive integer");
  }

  // 1. Get user's cart
  const cart = await getCart(parsedUserId);

  // 2. Find cart item (by product ID or cart item ID)
  let existingCartItem = cart.items.find(
    (item) => item.id === parsedId || (item.product && item.product.id === parsedId)
  );

  if (!existingCartItem) {
    // Check if the cart item exists in the database under another user
    const dbCartItem = await prisma.cartItem.findUnique({
      where: { id: parsedId },
      include: { cart: true },
    });

    if (dbCartItem) {
      if (dbCartItem.cart.userId !== parsedUserId) {
        throw new Error("Cart item does not belong to the current user");
      }
    }

    throw new Error("Cart item not found");
  }

  const productId = existingCartItem.product.id;

  // 3. Verify product exists and check stock
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });
  if (!product) {
    throw new Error("Product not found");
  }
  if (!product.isActive) {
    throw new Error("Product is inactive");
  }
  if (product.stock < parsedQuantity) {
    throw new Error("Insufficient stock");
  }

  // 4. Update cart item quantity
  await prisma.cartItem.update({
    where: { id: existingCartItem.id },
    data: { quantity: parsedQuantity },
  });

  // Return the updated cart
  return await getCart(parsedUserId);
};

/**
 * Remove an item from the user's cart.
 * @param {number|string} userId
 * @param {number|string} productIdOrItemId
 * @returns {Promise<Object>}
 */
const removeCartItem = async (userId, productIdOrItemId) => {
  const parsedUserId = parseInt(userId, 10);
  const parsedId = parseInt(productIdOrItemId, 10);

  if (isNaN(parsedUserId)) {
    throw new Error("Invalid user ID");
  }
  if (isNaN(parsedId)) {
    throw new Error("Invalid product or item ID");
  }

  // 1. Get user's cart
  const cart = await getCart(parsedUserId);

  // 2. Find cart item (by product ID or cart item ID)
  let existingCartItem = cart.items.find(
    (item) => item.id === parsedId || (item.product && item.product.id === parsedId)
  );

  if (!existingCartItem) {
    // Check if the cart item exists in the database under another user
    const dbCartItem = await prisma.cartItem.findUnique({
      where: { id: parsedId },
      include: { cart: true },
    });

    if (dbCartItem) {
      if (dbCartItem.cart.userId !== parsedUserId) {
        throw new Error("Cart item does not belong to the current user");
      }
    }

    throw new Error("Cart item not found");
  }

  // 3. Delete cart item
  await prisma.cartItem.delete({
    where: { id: existingCartItem.id },
  });

  // Return the updated cart
  return await getCart(parsedUserId);
};

export {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
};
