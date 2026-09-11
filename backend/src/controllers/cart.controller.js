import * as cartService from "../service/cart.service.js";

const getCart = async (req, res, next) => {
  try {
    const cart = await cartService.getCart(req.user.userId);
    return res.status(200).json({ success: true, cart });
  } catch (err) {
    next(err);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await cartService.addToCart(req.user.userId, { productId, quantity });
    return res.status(200).json({ success: true, message: "Item added to cart successfully", cart });
  } catch (err) {
    // Map known business-logic errors to 400
    if (!err.statusCode) err.statusCode = 400;
    next(err);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const productId = req.params.itemId || req.params.productId || req.params.id || req.body.productId;
    const { quantity } = req.body;
    const cart = await cartService.updateCartItem(req.user.userId, productId, { quantity });
    return res.status(200).json({ success: true, message: "Cart item updated successfully", cart });
  } catch (err) {
    if (err.message === "Cart item not found") err.statusCode = 404;
    if (err.message?.includes("does not belong")) err.statusCode = 403;
    next(err);
  }
};

const removeCartItem = async (req, res, next) => {
  try {
    const productId = req.params.itemId || req.params.productId || req.params.id || req.body.productId;
    const cart = await cartService.removeCartItem(req.user.userId, productId);
    return res.status(200).json({ success: true, message: "Item removed from cart successfully", cart });
  } catch (err) {
    if (err.message === "Cart item not found") err.statusCode = 404;
    if (err.message?.includes("does not belong")) err.statusCode = 403;
    next(err);
  }
};

export { getCart, addToCart, updateCartItem, removeCartItem };
