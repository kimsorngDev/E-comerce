import * as categoryService from "../service/category.service.js";

const createCategory = async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.body);
    return res.status(201).json({ success: true, message: "Category created successfully", category });
  } catch (err) {
    next(err);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getCategories();
    return res.status(200).json({ success: true, categories });
  } catch (err) {
    next(err);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    return res.status(200).json({ success: true, category });
  } catch (err) {
    if (err.message === "Category not found") err.statusCode = 404;
    next(err);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    return res.status(200).json({ success: true, message: "Category updated successfully", category });
  } catch (err) {
    if (err.message === "Category not found") err.statusCode = 404;
    next(err);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    await categoryService.deleteCategory(req.params.id);
    return res.status(200).json({ success: true, message: "Category deleted successfully" });
  } catch (err) {
    if (err.message === "Category not found") err.statusCode = 404;
    next(err);
  }
};

export { createCategory, getCategories, getCategoryById, updateCategory, deleteCategory };
