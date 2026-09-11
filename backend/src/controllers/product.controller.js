import * as productService from "../service/product.service.js";
import AppError from "../utils/AppError.js";

const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);
    return res.status(201).json({ success: true, message: "Product created successfully", product });
  } catch (err) {
    next(err);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const { categoryId, search, minPrice, maxPrice } = req.query;
    const products = await productService.getProducts({ categoryId, search, minPrice, maxPrice });
    return res.status(200).json({ success: true, products });
  } catch (err) {
    next(err);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    return res.status(200).json({ success: true, product });
  } catch (err) {
    if (err.message === "Product not found") err.statusCode = 404;
    next(err);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    return res.status(200).json({ success: true, message: "Product updated successfully", product });
  } catch (err) {
    if (err.message === "Product not found") err.statusCode = 404;
    next(err);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id);
    return res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    if (err.message === "Product not found") err.statusCode = 404;
    next(err);
  }
};

export { createProduct, getProducts, getProductById, updateProduct, deleteProduct };
