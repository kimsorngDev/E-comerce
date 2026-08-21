import prisma from "../config/database.js";

/**
 * Create a new category
 * @param {Object} data
 * @param {string} data.name
 * @returns {Promise<Object>}
 */
const createCategory = async ({ name }) => {
  if (!name || typeof name !== "string" || !name.trim()) {
    throw new Error("Category name is required");
  }

  const trimmedName = name.trim();

  // Check if category name already exists
  const existingCategory = await prisma.category.findUnique({
    where: { name: trimmedName },
  });

  if (existingCategory) {
    throw new Error("Category name already exists");
  }

  return await prisma.category.create({
    data: {
      name: trimmedName,
    },
  });
};

/**
 * Get all categories
 * @returns {Promise<Array>}
 */
const getCategories = async () => {
  return await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });
};

/**
 * Get a category by its ID
 * @param {number|string} id
 * @returns {Promise<Object>}
 */
const getCategoryById = async (id) => {
  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId)) {
    throw new Error("Invalid category ID");
  }

  const category = await prisma.category.findUnique({
    where: { id: parsedId },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  return category;
};

/**
 * Update a category
 * @param {number|string} id
 * @param {Object} data
 * @param {string} data.name
 * @returns {Promise<Object>}
 */
const updateCategory = async (id, { name }) => {
  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId)) {
    throw new Error("Invalid category ID");
  }

  if (!name || typeof name !== "string" || !name.trim()) {
    throw new Error("Category name is required");
  }

  const trimmedName = name.trim();

  // Check if category exists
  const category = await prisma.category.findUnique({
    where: { id: parsedId },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  // Check if the new name is already taken by another category
  const existingCategory = await prisma.category.findUnique({
    where: { name: trimmedName },
  });

  if (existingCategory && existingCategory.id !== parsedId) {
    throw new Error("Category name already exists");
  }

  return await prisma.category.update({
    where: { id: parsedId },
    data: {
      name: trimmedName,
    },
  });
};

/**
 * Delete a category
 * @param {number|string} id
 * @returns {Promise<Object>}
 */
const deleteCategory = async (id) => {
  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId)) {
    throw new Error("Invalid category ID");
  }

  // Check if category exists
  const category = await prisma.category.findUnique({
    where: { id: parsedId },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  return await prisma.category.delete({
    where: { id: parsedId },
  });
};

export {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
