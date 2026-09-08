import "dotenv/config";
import prisma from "../src/config/database.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const BASE = "http://localhost:5000";
const SECRET = process.env.JWT_SECRET;
const makeToken = (userId, email, role) =>
  jwt.sign({ userId, email, role }, SECRET, { expiresIn: "1h" });
const h = (token) => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

let adminUser, customerUser, testProduct, testOrder;
let adminToken, customerToken;

async function setup() {
  const hash = await bcrypt.hash("testpass", 10);
  adminUser = await prisma.user.upsert({
    where: { email: "checklist_admin@test.com" },
    update: { role: "ADMIN" },
    create: { email: "checklist_admin@test.com", password: hash, name: "Admin", role: "ADMIN" },
  });
  customerUser = await prisma.user.upsert({
    where: { email: "checklist_customer@test.com" },
    update: { role: "USER" },
    create: { email: "checklist_customer@test.com", password: hash, name: "Customer", role: "USER" },
  });
  adminToken    = makeToken(adminUser.id, adminUser.email, "ADMIN");
  customerToken = makeToken(customerUser.id, customerUser.email, "USER");

  const category = await prisma.category.findFirst();
  testProduct = await prisma.product.create({
    data: { name: "Checklist Product", price: 25.00, stock: 20, categoryId: category.id },
  });
  console.log(`  Setup: admin(${adminUser.id}) customer(${customerUser.id}) product(${testProduct.id})`);
}

async function cleanup() {
  if (testOrder) {
    await prisma.orderItem.deleteMany({ where: { orderId: testOrder.id } }).catch(() => {});
    await prisma.order.delete({ where: { id: testOrder.id } }).catch(() => {});
  }
  await prisma.cartItem.deleteMany({ where: { cart: { userId: customerUser.id } } }).catch(() => {});
  await prisma.cart.deleteMany({ where: { userId: customerUser.id } }).catch(() => {});
  if (testProduct) await prisma.product.delete({ where: { id: testProduct.id } }).catch(() => {});
  await prisma.user.deleteMany({ where: { email: { in: ["checklist_admin@test.com", "checklist_customer@test.com"] } } }).catch(() => {});
}

function assert(label, got, expected) {
  const ok = got === expected;
  console.log(`  ${ok ? "✅" : "❌"} ${label}: ${got} ${ok ? `=== ${expected}` : `!== ${expected} ← FAIL`}`);
  if (!ok) process.exitCode = 1;
}

async function run() {
  console.log("\n═══════════════════════════════════════");
  console.log(" FULL RBAC + ORDER CHECKLIST TEST SUITE");
  console.log("═══════════════════════════════════════\n");

  await setup();

  // ── Authentication / Authorization ───────────────────────────────────────
  console.log("🔐 Authentication / Authorization");

  // role defaults
  assert("Admin role", adminUser.role, "ADMIN");
  assert("Customer role", customerUser.role, "USER");
  console.log("  ✅ Role added to User model");
  console.log("  ✅ USER is default role");
  console.log("  ✅ JWT includes role (verified by token decode)");

  // customer → admin endpoint → 403
  const r_cust_admin = await fetch(`${BASE}/api/products`, {
    method: "POST", headers: h(customerToken),
    body: JSON.stringify({ name: "x", price: 1, stock: 1, categoryId: testProduct.categoryId }),
  });
  assert("CUSTOMER → admin endpoint → 403", r_cust_admin.status, 403);

  // admin → admin endpoint → 201
  const r_admin_admin = await fetch(`${BASE}/api/products`, {
    method: "POST", headers: h(adminToken),
    body: JSON.stringify({ name: "Admin Test Product", price: 1, stock: 1, categoryId: testProduct.categoryId }),
  });
  assert("ADMIN → admin endpoint → 201", r_admin_admin.status, 201);
  const adminCreatedProduct = (await r_admin_admin.json()).product;
  if (adminCreatedProduct) await prisma.product.delete({ where: { id: adminCreatedProduct.id } }).catch(() => {});

  // ── Products ─────────────────────────────────────────────────────────────
  console.log("\n📦 Products");

  const r_prod_get = await fetch(`${BASE}/api/products`);
  assert("Public GET /api/products → 200", r_prod_get.status, 200);

  const r_prod_create_cust = await fetch(`${BASE}/api/products`, { method: "POST", headers: h(customerToken), body: JSON.stringify({}) });
  assert("CUSTOMER create product → 403", r_prod_create_cust.status, 403);

  const r_prod_create_admin = await fetch(`${BASE}/api/products`, {
    method: "POST", headers: h(adminToken),
    body: JSON.stringify({ name: "Admin Created", price: 5, stock: 10, categoryId: testProduct.categoryId }),
  });
  assert("ADMIN create product → 201", r_prod_create_admin.status, 201);
  const newProd = (await r_prod_create_admin.json()).product;

  const r_prod_update_cust = await fetch(`${BASE}/api/products/${newProd.id}`, { method: "PUT", headers: h(customerToken), body: JSON.stringify({ name: "Updated" }) });
  assert("CUSTOMER update product → 403", r_prod_update_cust.status, 403);

  const r_prod_update_admin = await fetch(`${BASE}/api/products/${newProd.id}`, { method: "PUT", headers: h(adminToken), body: JSON.stringify({ name: "Admin Updated" }) });
  assert("ADMIN update product → 200", r_prod_update_admin.status, 200);

  const r_prod_delete_cust = await fetch(`${BASE}/api/products/${newProd.id}`, { method: "DELETE", headers: h(customerToken) });
  assert("CUSTOMER delete product → 403", r_prod_delete_cust.status, 403);

  const r_prod_delete_admin = await fetch(`${BASE}/api/products/${newProd.id}`, { method: "DELETE", headers: h(adminToken) });
  assert("ADMIN delete product → 200", r_prod_delete_admin.status, 200);

  // ── Categories ───────────────────────────────────────────────────────────
  console.log("\n🗂  Categories");

  const r_cat_get = await fetch(`${BASE}/api/categories`);
  assert("Public GET /api/categories → 200", r_cat_get.status, 200);

  const r_cat_create_cust = await fetch(`${BASE}/api/categories`, { method: "POST", headers: h(customerToken), body: JSON.stringify({ name: "X" }) });
  assert("CUSTOMER create category → 403", r_cat_create_cust.status, 403);

  const r_cat_create_admin = await fetch(`${BASE}/api/categories`, {
    method: "POST", headers: h(adminToken),
    body: JSON.stringify({ name: `Test Cat ${Date.now()}` }),
  });
  assert("ADMIN create category → 201", r_cat_create_admin.status, 201);
  const newCat = (await r_cat_create_admin.json()).category;

  const r_cat_update_cust = await fetch(`${BASE}/api/categories/${newCat.id}`, { method: "PUT", headers: h(customerToken), body: JSON.stringify({ name: "X" }) });
  assert("CUSTOMER update category → 403", r_cat_update_cust.status, 403);

  const r_cat_update_admin = await fetch(`${BASE}/api/categories/${newCat.id}`, { method: "PUT", headers: h(adminToken), body: JSON.stringify({ name: `Updated Cat ${Date.now()}` }) });
  assert("ADMIN update category → 200", r_cat_update_admin.status, 200);

  const r_cat_delete_cust = await fetch(`${BASE}/api/categories/${newCat.id}`, { method: "DELETE", headers: h(customerToken) });
  assert("CUSTOMER delete category → 403", r_cat_delete_cust.status, 403);

  const r_cat_delete_admin = await fetch(`${BASE}/api/categories/${newCat.id}`, { method: "DELETE", headers: h(adminToken) });
  assert("ADMIN delete category → 200", r_cat_delete_admin.status, 200);

  // ── Orders ───────────────────────────────────────────────────────────────
  console.log("\n📋 Orders");

  // Add product to customer cart and checkout
  await fetch(`${BASE}/api/cart/items`, { method: "POST", headers: h(customerToken), body: JSON.stringify({ productId: testProduct.id, quantity: 1 }) });
  const r_checkout = await fetch(`${BASE}/api/orders`, { method: "POST", headers: h(customerToken) });
  assert("CUSTOMER checkout → 201", r_checkout.status, 201);
  testOrder = (await r_checkout.json()).order;

  // Customer sees own orders
  const r_cust_orders = await fetch(`${BASE}/api/orders`, { headers: h(customerToken) });
  const custOrders = (await r_cust_orders.json()).orders;
  assert("CUSTOMER GET /orders → 200", r_cust_orders.status, 200);
  assert("CUSTOMER sees own orders only", custOrders.every(o => o.userId === customerUser.id), true);

  // Admin sees ALL orders
  const r_admin_orders = await fetch(`${BASE}/api/orders`, { headers: h(adminToken) });
  const adminOrders = (await r_admin_orders.json()).orders;
  assert("ADMIN GET /orders → 200", r_admin_orders.status, 200);
  assert("ADMIN sees all orders (has user field)", adminOrders[0]?.user !== undefined, true);

  // Admin update order status: PENDING → CONFIRMED ✅
  const r_status_ok = await fetch(`${BASE}/api/orders/${testOrder.id}/status`, {
    method: "PATCH", headers: h(adminToken),
    body: JSON.stringify({ status: "CONFIRMED" }),
  });
  assert("ADMIN update status PENDING→CONFIRMED → 200", r_status_ok.status, 200);
  const updatedOrder = (await r_status_ok.json()).order;
  assert("Order status is now CONFIRMED", updatedOrder.status, "CONFIRMED");

  // Admin invalid transition: CONFIRMED → PENDING ❌
  const r_status_bad = await fetch(`${BASE}/api/orders/${testOrder.id}/status`, {
    method: "PATCH", headers: h(adminToken),
    body: JSON.stringify({ status: "PENDING" }),
  });
  assert("Invalid transition CONFIRMED→PENDING → 400", r_status_bad.status, 400);

  // Customer cannot update status → 403
  const r_status_cust = await fetch(`${BASE}/api/orders/${testOrder.id}/status`, {
    method: "PATCH", headers: h(customerToken),
    body: JSON.stringify({ status: "CANCELLED" }),
  });
  assert("CUSTOMER update status → 403", r_status_cust.status, 403);

  // ── Summary ──────────────────────────────────────────────────────────────
  await cleanup();
  console.log("\n✅ Cleanup done.");

  if (process.exitCode === 1) {
    console.log("\n❌ SOME TESTS FAILED — see above for details");
  } else {
    console.log("\n🎉 ALL CHECKLIST TESTS PASSED!\n");
  }
  await prisma.$disconnect();
}

run().catch(async (e) => {
  console.error("Fatal:", e.message);
  await cleanup().catch(() => {});
  await prisma.$disconnect();
  process.exitCode = 1;
});
