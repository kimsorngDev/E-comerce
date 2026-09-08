import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";

import authRoutes from "./src/routes/auth.routes.js";
import categoryRoutes from "./src/routes/category.routes.js";
import productRoutes from "./src/routes/product.routes.js";
import cartRoutes from "./src/routes/cart.routes.js";
import orderRoutes from "./src/routes/order.routes.js";
<<<<<<< HEAD
import swaggerSpec from "./src/config/swagger.js";
=======
>>>>>>> 8b2c505 (update week6)

const app = express();

// Enable CORS
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is running",
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Category routes
app.use("/api/categories", categoryRoutes);

// Product routes
app.use("/api/products", productRoutes);

// Cart routes
app.use("/api/cart", cartRoutes);

// Order routes
app.use("/api/orders", orderRoutes);

<<<<<<< HEAD
// Swagger API Docs
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: "E-Commerce API Docs",
  customCss: `.swagger-ui .topbar { display: none }`,
}));

// Expose raw OpenAPI JSON spec
app.get("/api/docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

=======
>>>>>>> 8b2c505 (update week6)
// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

export default app;