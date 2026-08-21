import prisma from "../config/database.js";

/**
 * Create a new product
 * @param {Object} data
 * @param {string} data.name
 * @param {string} [data.description]
 * @param {number|string} data.price
 * @param {number} [data.stock]
 * @param {string} [data.imageUrl]
 * @param {boolean} [data.isActive]
 * @param {number|string} data.categoryId
 * @returns {Promise<Object>}
 */
const createProduct = async ({ name, description, price, stock, imageUrl, isActive, categoryId }) => {
  if (!name || typeof name !== "string" || !name.trim()) {
    throw new Error("Product name is required");
  }

  if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) {
    throw new Error("Valid product price is required and must be non-negative");
  }

  if (stock !== undefined) {
    const parsedStock = parseInt(stock, 10);
    if (isNaN(parsedStock) || parsedStock < 0) {
      throw new Error("Product stock must be a non-negative integer");
    }
  }

  const parsedCategoryId = parseInt(categoryId, 10);
  if (isNaN(parsedCategoryId)) {
    throw new Error("Valid category ID is required");
  }

  // Verify category exists
  const categoryExists = await prisma.category.findUnique({
    where: { id: parsedCategoryId },
  });

  if (!categoryExists) {
    throw new Error("Category not found");
  }

  return await prisma.product.create({
    data: {
      name: name.trim(),
      description: description || null,
      price: Number(price),
      stock: stock !== undefined ? parseInt(stock, 10) : 0,
      imageUrl: imageUrl || null,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      categoryId: parsedCategoryId,
    },
    include: {
      category: true,
    },
  });
};

/**
 * Get products with optional filtering
 * @param {Object} [filters]
 * @param {number|string} [filters.categoryId]
 * @param {string} [filters.search]
 * @param {number|string} [filters.minPrice]
 * @param {number|string} [filters.maxPrice]
 * @returns {Promise<Array>}
 */
const getProducts = async (filters = {}) => {
  const where = {};

  if (filters.categoryId) {
    const catId = parseInt(filters.categoryId, 10);
    if (!isNaN(catId)) {
      where.categoryId = catId;
    }
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters.minPrice !== undefined) {
    const min = parseFloat(filters.minPrice);
    if (!isNaN(min)) {
      where.price = { ...where.price, gte: min };
    }
  }

  if (filters.maxPrice !== undefined) {
    const max = parseFloat(filters.maxPrice);
    if (!isNaN(max)) {
      where.price = { ...where.price, lte: max };
    }
  }

  return await prisma.product.findMany({
    where,
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

/**
 * Get product by ID
 * @param {number|string} id
 * @returns {Promise<Object>}
 */
const getProductById = async (id) => {
  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId)) {
    throw new Error("Invalid product ID");
  }

  const product = await prisma.product.findUnique({
    where: { id: parsedId },
    include: {
      category: true,
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  return product;
};

/**
 * Update a product
 * @param {number|string} id
 * @param {Object} data
 * @returns {Promise<Object>}
 */
const updateProduct = async (id, data) => {
  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId)) {
    throw new Error("Invalid product ID");
  }

  // Verify product exists
  const existingProduct = await prisma.product.findUnique({
    where: { id: parsedId },
  });

  if (!existingProduct) {
    throw new Error("Product not found");
  }

  const updateData = {};

  if (data.name !== undefined) {
    if (typeof data.name !== "string" || !data.name.trim()) {
      throw new Error("Product name cannot be empty");
    }
    updateData.name = data.name.trim();
  }

  if (data.description !== undefined) {
    updateData.description = data.description || null;
  }

  if (data.price !== undefined) {
    if (isNaN(Number(data.price)) || Number(data.price) < 0) {
      throw new Error("Product price must be a non-negative number");
    }
    updateData.price = Number(data.price);
  }

  if (data.stock !== undefined) {
    const parsedStock = parseInt(data.stock, 10);
    if (isNaN(parsedStock) || parsedStock < 0) {
      throw new Error("Product stock must be a non-negative integer");
    }
    updateData.stock = parsedStock;
  }

  if (data.imageUrl !== undefined) {
    updateData.imageUrl = data.imageUrl || null;
  }

  if (data.isActive !== undefined) {
    updateData.isActive = Boolean(data.isActive);
  }

  if (data.categoryId !== undefined) {
    const parsedCategoryId = parseInt(data.categoryId, 10);
    if (isNaN(parsedCategoryId)) {
      throw new Error("Valid category ID is required");
    }

    const categoryExists = await prisma.category.findUnique({
      where: { id: parsedCategoryId },
    });

    if (!categoryExists) {
      throw new Error("Category not found");
    }

    updateData.categoryId = parsedCategoryId;
  }

  return await prisma.product.update({
    where: { id: parsedId },
    data: updateData,
    include: {
      category: true,
    },
  });
};

/**
 * Delete a product
 * @param {number|string} id
 * @returns {Promise<Object>}
 */
const deleteProduct = async (id) => {
  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId)) {
    throw new Error("Invalid product ID");
  }

  const existingProduct = await prisma.product.findUnique({
    where: { id: parsedId },
  });

  if (!existingProduct) {
    throw new Error("Product not found");
  }

  return await prisma.product.delete({
    where: { id: parsedId },
  });
};

export {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
