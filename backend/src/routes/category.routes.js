import express from "express";
import * as categoryController from "../controllers/category.controller.js";

const router = express.Router();

// Public routes
router.get("/", categoryController.getCategories);
router.get("/:id", categoryController.getCategoryById);

// Write routes (can be protected in the future if authorization is needed)
router.post("/", categoryController.createCategory);
router.put("/:id", categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);

export default router;
