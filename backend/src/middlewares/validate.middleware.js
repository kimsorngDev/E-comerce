import AppError from "../utils/AppError.js";

// ── Helper ────────────────────────────────────────────────────────────────────

/**
 * Collect all validation errors and throw a single 422 AppError if any exist.
 */
const throwIfErrors = (errors) => {
  if (errors.length > 0) {
    const err = new AppError(errors.join(", "), 422);
    err.errors = errors;
    throw err;
  }
};

// ── Product Validation ────────────────────────────────────────────────────────

export const validateCreateProduct = (req, res, next) => {
  try {
    const { name, price, stock, categoryId } = req.body;
    const errors = [];

    if (!name || typeof name !== "string" || name.trim() === "") {
      errors.push("name is required");
    }

    const parsedPrice = parseFloat(price);
    if (price === undefined || price === null || price === "") {
      errors.push("price is required");
    } else if (isNaN(parsedPrice) || parsedPrice <= 0) {
      errors.push("price must be a positive number");
    }

    const parsedStock = parseInt(stock, 10);
    if (stock === undefined || stock === null || stock === "") {
      errors.push("stock is required");
    } else if (isNaN(parsedStock) || parsedStock < 0) {
      errors.push("stock must be a non-negative integer");
    }

    const parsedCategoryId = parseInt(categoryId, 10);
    if (!categoryId) {
      errors.push("categoryId is required");
    } else if (isNaN(parsedCategoryId) || parsedCategoryId <= 0) {
      errors.push("categoryId must be a positive integer");
    }

    throwIfErrors(errors);
    next();
  } catch (err) {
    next(err);
  }
};

export const validateUpdateProduct = (req, res, next) => {
  try {
    const { price, stock, categoryId } = req.body;
    const errors = [];

    if (price !== undefined && price !== null && price !== "") {
      const parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        errors.push("price must be a positive number");
      }
    }

    if (stock !== undefined && stock !== null && stock !== "") {
      const parsedStock = parseInt(stock, 10);
      if (isNaN(parsedStock) || parsedStock < 0) {
        errors.push("stock must be a non-negative integer");
      }
    }

    if (categoryId !== undefined && categoryId !== null && categoryId !== "") {
      const parsedCategoryId = parseInt(categoryId, 10);
      if (isNaN(parsedCategoryId) || parsedCategoryId <= 0) {
        errors.push("categoryId must be a positive integer");
      }
    }

    throwIfErrors(errors);
    next();
  } catch (err) {
    next(err);
  }
};

// ── Category Validation ───────────────────────────────────────────────────────

export const validateCategory = (req, res, next) => {
  try {
    const { name } = req.body;
    const errors = [];

    if (!name || typeof name !== "string" || name.trim() === "") {
      errors.push("name is required");
    }

    throwIfErrors(errors);
    next();
  } catch (err) {
    next(err);
  }
};

// ── Cart Validation ───────────────────────────────────────────────────────────

export const validateAddToCart = (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const errors = [];

    const parsedProductId = parseInt(productId, 10);
    if (!productId) {
      errors.push("productId is required");
    } else if (isNaN(parsedProductId) || parsedProductId <= 0) {
      errors.push("productId must be a positive integer");
    }

    const parsedQuantity = parseInt(quantity, 10);
    if (quantity === undefined || quantity === null || quantity === "") {
      errors.push("quantity is required");
    } else if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      errors.push("quantity must be a positive integer greater than 0");
    }

    throwIfErrors(errors);
    next();
  } catch (err) {
    next(err);
  }
};

export const validateUpdateCartItem = (req, res, next) => {
  try {
    const { quantity } = req.body;
    const errors = [];

    const parsedQuantity = parseInt(quantity, 10);
    if (quantity === undefined || quantity === null || quantity === "") {
      errors.push("quantity is required");
    } else if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      errors.push("quantity must be a positive integer greater than 0");
    }

    throwIfErrors(errors);
    next();
  } catch (err) {
    next(err);
  }
};

// ── Order Status Validation ───────────────────────────────────────────────────

const VALID_ORDER_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export const validateOrderStatus = (req, res, next) => {
  try {
    const { status } = req.body;
    const errors = [];

    if (!status) {
      errors.push("status is required");
    } else if (!VALID_ORDER_STATUSES.includes(status)) {
      errors.push(`status must be one of: ${VALID_ORDER_STATUSES.join(", ")}`);
    }

    throwIfErrors(errors);
    next();
  } catch (err) {
    next(err);
  }
};

// ── Auth Validation ───────────────────────────────────────────────────────────

export const validateRegister = (req, res, next) => {
  try {
    const { email, password } = req.body;
    const errors = [];

    if (!email || typeof email !== "string" || email.trim() === "") {
      errors.push("email is required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.push("email must be a valid email address");
    }

    if (!password || typeof password !== "string") {
      errors.push("password is required");
    } else if (password.length < 6) {
      errors.push("password must be at least 6 characters");
    }

    throwIfErrors(errors);
    next();
  } catch (err) {
    next(err);
  }
};

export const validateLogin = (req, res, next) => {
  try {
    const { email, password } = req.body;
    const errors = [];

    if (!email) errors.push("email is required");
    if (!password) errors.push("password is required");

    throwIfErrors(errors);
    next();
  } catch (err) {
    next(err);
  }
};
