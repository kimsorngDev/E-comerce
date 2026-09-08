import "dotenv/config";
import prisma from "../src/config/database.js";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Starting seeding database...");

  // Clean up existing data to avoid duplication/constraint conflicts
  console.log("Cleaning up database...");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Password123!", 10);

  // 1. Create 20 Users
  console.log("Seeding 20 Users...");
  const users = [];
  for (let i = 1; i <= 20; i++) {
    const user = await prisma.user.create({
      data: {
        email: `user${i}@example.com`,
        password: passwordHash,
        name: `User Number ${i}`,
      },
    });
    users.push(user);
  }

  // 2. Create 20 Carts (1:1 with User)
  console.log("Seeding 20 Carts...");
  const carts = [];
  for (let i = 0; i < 20; i++) {
    const cart = await prisma.cart.create({
      data: {
        userId: users[i].id,
      },
    });
    carts.push(cart);
  }

  // 3. Create 20 Categories
  console.log("Seeding 20 Categories...");
  const categoriesList = [
    "Electronics", "Clothing", "Books", "Home & Kitchen", "Beauty & Care",
    "Sports & Outdoors", "Toys & Games", "Automotive", "Health & Wellness", "Garden & Outdoor",
    "Grocery & Gourmet", "Pet Supplies", "Office Products", "Tools & Improvement", "Baby Care",
    "Music & Instruments", "Movies & TV", "Handmade Crafts", "Jewelry & Accessories", "Software & Apps"
  ];
  const categories = [];
  for (let i = 0; i < 20; i++) {
    const category = await prisma.category.create({
      data: {
        name: categoriesList[i],
      },
    });
    categories.push(category);
  }

  // 4. Create 20 Products (each assigned to one category)
  console.log("Seeding 20 Products...");
  const products = [];
  for (let i = 1; i <= 20; i++) {
    const sampleImages = [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=600&q=80"
    ];
    const product = await prisma.product.create({
      data: {
        name: `Product ${i}`,
        description: `This is the detailed description for premium Product ${i}.`,
        price: 19.99 + i * 5.0,
        stock: 10 + i * 2,
        imageUrl: sampleImages[(i - 1) % sampleImages.length],
        isActive: true,
        categoryId: categories[i - 1].id,
      },
    });
    products.push(product);
  }

  // 5. Create 20 CartItems (spread across carts and products)
  console.log("Seeding 20 CartItems...");
  for (let i = 0; i < 20; i++) {
    // cart i gets product i
    await prisma.cartItem.create({
      data: {
        cartId: carts[i].id,
        productId: products[i].id,
        quantity: (i % 3) + 1,
      },
    });
  }

  // 6. Create 20 Orders
  console.log("Seeding 20 Orders...");
  const orders = [];
  for (let i = 0; i < 20; i++) {
    const userIndex = i % 20; // distribute among users
    const order = await prisma.order.create({
      data: {
        userId: users[userIndex].id,
        status: i % 2 === 0 ? "DELIVERED" : "PENDING",
        totalAmount: products[i].price.mul ? products[i].price.mul((i % 3) + 1) : (19.99 + (i + 1) * 5.0) * ((i % 3) + 1),
      },
    });
    orders.push(order);
  }

  // 7. Create 20 OrderItems
  console.log("Seeding 20 OrderItems...");
  for (let i = 0; i < 20; i++) {
    await prisma.orderItem.create({
      data: {
        orderId: orders[i].id,
        productId: products[i].id,
        quantity: (i % 3) + 1,
        price: products[i].price,
      },
    });
  }

  console.log("Database seeded successfully with 20 records per table!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
