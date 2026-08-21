import * as productService from "../service/product.service.js";

/**
 * Create a new product
 */
const createProduct = async (req, res) => {
  try {
    const product = await productService.createProduct(req.body);

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get all products (with optional filtering)
 */
const getProducts = async (req, res) => {
  try {
    const { categoryId, search, minPrice, maxPrice } = req.query;
    const products = await productService.getProducts({
      categoryId,
      search,
      minPrice,
      maxPrice,
    });

    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get product by ID
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    const status = error.message === "Product not found" ? 404 : 400;
    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update a product
 */
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productService.updateProduct(id, req.body);

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    const status = error.message === "Product not found" ? 404 : 400;
    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete a product
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await productService.deleteProduct(id);

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    const status = error.message === "Product not found" ? 404 : 400;
    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
