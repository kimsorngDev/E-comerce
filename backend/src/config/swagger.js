import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "E-Commerce API",
      version: "1.0.0",
      description:
        "REST API for an E-Commerce platform. Supports authentication, products, categories, cart, and order management.",
      contact: {
        name: "API Support",
      },
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token obtained from /api/auth/login",
        },
      },
      schemas: {
        // ── Auth ──────────────────────────────────────────────────────────
        RegisterRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", example: "user@example.com" },
            password: { type: "string", minLength: 6, example: "password123" },
            name: { type: "string", example: "John Doe" },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", example: "user@example.com" },
            password: { type: "string", example: "password123" },
          },
        },
        AuthUser: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            email: { type: "string", example: "user@example.com" },
            name: { type: "string", example: "John Doe" },
            role: { type: "string", enum: ["USER", "ADMIN"], example: "USER" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        LoginResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Login successful" },
            token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
            user: { $ref: "#/components/schemas/AuthUser" },
          },
        },

        // ── Category ──────────────────────────────────────────────────────
        Category: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Electronics" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        CategoryRequest: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", example: "Electronics" },
          },
        },

        // ── Product ───────────────────────────────────────────────────────
        Product: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Wireless Headphones" },
            description: { type: "string", example: "Noise cancelling over-ear headphones" },
            price: { type: "number", format: "float", example: 49.99 },
            stock: { type: "integer", example: 100 },
            imageUrl: { type: "string", nullable: true, example: "https://example.com/image.jpg" },
            isActive: { type: "boolean", example: true },
            categoryId: { type: "integer", example: 1 },
            category: { $ref: "#/components/schemas/Category" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        CreateProductRequest: {
          type: "object",
          required: ["name", "price", "categoryId"],
          properties: {
            name: { type: "string", example: "Wireless Headphones" },
            description: { type: "string", example: "Noise cancelling over-ear headphones" },
            price: { type: "number", format: "float", example: 49.99 },
            stock: { type: "integer", default: 0, example: 100 },
            imageUrl: { type: "string", nullable: true, example: "https://example.com/image.jpg" },
            isActive: { type: "boolean", default: true },
            categoryId: { type: "integer", example: 1 },
          },
        },
        UpdateProductRequest: {
          type: "object",
          properties: {
            name: { type: "string", example: "Wireless Headphones Pro" },
            description: { type: "string", example: "Updated description" },
            price: { type: "number", format: "float", example: 59.99 },
            stock: { type: "integer", example: 50 },
            imageUrl: { type: "string", nullable: true },
            isActive: { type: "boolean" },
            categoryId: { type: "integer", example: 2 },
          },
        },

        // ── Cart ──────────────────────────────────────────────────────────
        CartProduct: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Wireless Headphones" },
            price: { type: "number", example: 49.99 },
          },
        },
        CartItem: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            quantity: { type: "integer", example: 2 },
            product: { $ref: "#/components/schemas/CartProduct" },
          },
        },
        Cart: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            items: {
              type: "array",
              items: { $ref: "#/components/schemas/CartItem" },
            },
            total: { type: "number", example: 99.98 },
          },
        },
        AddToCartRequest: {
          type: "object",
          required: ["productId", "quantity"],
          properties: {
            productId: { type: "integer", example: 1 },
            quantity: { type: "integer", minimum: 1, example: 2 },
          },
        },
        UpdateCartItemRequest: {
          type: "object",
          required: ["quantity"],
          properties: {
            quantity: { type: "integer", minimum: 1, example: 3 },
          },
        },

        // ── Order ─────────────────────────────────────────────────────────
        OrderProduct: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Wireless Headphones" },
            description: { type: "string", nullable: true },
            price: { type: "number", example: 59.99, description: "Current product price (may differ from order snapshot)" },
            imageUrl: { type: "string", nullable: true },
          },
        },
        OrderItem: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            quantity: { type: "integer", example: 2 },
            price: { type: "number", example: 49.99, description: "Snapshot price at time of purchase" },
            product: { $ref: "#/components/schemas/OrderProduct" },
          },
        },
        Order: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            userId: { type: "integer", example: 1 },
            status: {
              type: "string",
              enum: ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"],
              example: "PENDING",
            },
            totalAmount: { type: "number", example: 99.98 },
            items: {
              type: "array",
              items: { $ref: "#/components/schemas/OrderItem" },
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },

        // ── Common ────────────────────────────────────────────────────────
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Operation completed successfully" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Error description" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
