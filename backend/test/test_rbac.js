import "dotenv/config";
import prisma from "../src/config/database.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const BASE = "http://localhost:5000";
const SECRET = process.env.JWT_SECRET;

const makeToken = (userId, email, role) =>
  jwt.sign({ userId, email, role }, SECRET, { expiresIn: "1h" });

async function run() {
  console.log("--- RBAC Role Tests ---");

  // Setup: create admin + user accounts
  const hash = await bcrypt.hash("testpass", 10);

  const admin = await prisma.user.upsert({
    where: { email: "rbac_admin@test.com" },
    update: { role: "ADMIN" },
    create: { email: "rbac_admin@test.com", password: hash, name: "Test Admin", role: "ADMIN" },
  });

  const user = await prisma.user.upsert({
    where: { email: "rbac_user@test.com" },
    update: { role: "USER" },
    create: { email: "rbac_user@test.com", password: hash, name: "Test User", role: "USER" },
  });

  console.log("✅ Created admin (ID:", admin.id, "role:", admin.role + ") and user (ID:", user.id, "role:", user.role + ")");

  const adminToken = makeToken(admin.id, admin.email, "ADMIN");
  const userToken  = makeToken(user.id, user.email, "USER");

  // Use first real category id
  const firstCategory = await prisma.category.findFirst();
  if (!firstCategory) throw new Error("No categories in DB — run seed first");
  const categoryId = firstCategory.id;

  const body = JSON.stringify({ name: "RBAC Test Product", price: 9.99, stock: 5, categoryId });

  // Test 1: No token → 401
  const r1 = await fetch(`${BASE}/api/products`, { method: "POST", headers: { "Content-Type": "application/json" }, body });
  console.log("✅ POST /api/products (no token):   ", r1.status, "=== 401?", r1.status === 401);

  // Test 2: USER token → 403
  const r2 = await fetch(`${BASE}/api/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${userToken}` },
    body,
  });
  console.log("✅ POST /api/products (USER token): ", r2.status, "=== 403?", r2.status === 403);

  // Test 3: ADMIN token → 201
  const r3 = await fetch(`${BASE}/api/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
    body,
  });
  const r3data = await r3.json();
  console.log("✅ POST /api/products (ADMIN token):", r3.status, "=== 201?", r3.status === 201);

  // Test 4: GET /api/products → 200 for everyone (no token)
  const r4 = await fetch(`${BASE}/api/products`);
  console.log("✅ GET  /api/products (no token):   ", r4.status, "=== 200?", r4.status === 200);

  // Test 5: GET /api/categories → 200 (public)
  const r5 = await fetch(`${BASE}/api/categories`);
  console.log("✅ GET  /api/categories (no token): ", r5.status, "=== 200?", r5.status === 200);

  // Test 6: POST /api/categories with USER token → 403
  const r6 = await fetch(`${BASE}/api/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({ name: "RBAC Test Category" }),
  });
  console.log("✅ POST /api/categories (USER token):", r6.status, "=== 403?", r6.status === 403);

  // Cleanup test product
  if (r3data.product?.id) {
    await prisma.product.delete({ where: { id: r3data.product.id } });
  }
  await prisma.user.deleteMany({ where: { email: { in: ["rbac_admin@test.com", "rbac_user@test.com"] } } });
  console.log("✅ Cleaned up test data");

  const allPassed = [r1.status === 401, r2.status === 403, r3.status === 201, r4.status === 200, r5.status === 200, r6.status === 403].every(Boolean);
  if (allPassed) {
    console.log("\n🎉 ALL RBAC TESTS PASSED!");
  } else {
    console.error("\n❌ Some tests failed!");
    process.exitCode = 1;
  }

  await prisma.$disconnect();
}

run().catch(async (e) => {
  console.error("❌ Fatal:", e.message);
  await prisma.$disconnect();
  process.exitCode = 1;
});
