import express from "express";
import * as cartController from "../controllers/cart.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// Apply authMiddleware to protect all cart routes
router.get("/", authMiddleware, cartController.getCart);
router.post("/items", authMiddleware, cartController.addToCart);
router.put("/items/:itemId", authMiddleware, cartController.updateCartItem);
router.delete("/items/:itemId", authMiddleware, cartController.removeCartItem);

export default router;
