import * as cartService from "../service/cart.service.js";

/**
 * Get user's cart
 */
const getCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const cart = await cartService.getCart(userId);
    return res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Add an item to user's cart
 */
const addToCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId, quantity } = req.body;
    const cart = await cartService.addToCart(userId, { productId, quantity });
    return res.status(200).json({
      success: true,
      message: "Item added to cart successfully",
      cart,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update a cart item quantity
 */
const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.userId;
    const productId = req.params.itemId || req.params.productId || req.params.id || req.body.productId;
    const { quantity } = req.body;
    
    const cart = await cartService.updateCartItem(userId, productId, { quantity });
    return res.status(200).json({
      success: true,
      message: "Cart item updated successfully",
      cart,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Remove an item from the cart
 */
const removeCartItem = async (req, res) => {
  try {
    const userId = req.user.userId;
    const productId = req.params.itemId || req.params.productId || req.params.id || req.body.productId;
    
    const cart = await cartService.removeCartItem(userId, productId);
    return res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
      cart,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
};
