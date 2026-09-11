import "dotenv/config";
import prisma from "../src/config/database.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const BASE = "http://localhost:5000";
const SECRET = process.env.JWT_SECRET;
const makeToken = (u) => jwt.sign({ userId: u.id, email: u.email, role: u.role }, SECRET, { expiresIn: "1h" });
const j = (body) => JSON.stringify(body);
const h = (token) => ({ "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) });

let admin, customer, customer2, product, adminToken, customerToken, customer2Token;

async function setup() {
  const hash = await bcrypt.hash("testpass123", 10);
  admin = await prisma.user.upsert({ where: { email: "w7_admin@test.com" }, update: { role: "ADMIN" }, create: { email: "w7_admin@test.com", password: hash, name: "Admin", role: "ADMIN" } });
  customer = await prisma.user.upsert({ where: { email: "w7_cust@test.com" }, update: { role: "USER" }, create: { email: "w7_cust@test.com", password: hash, name: "Customer", role: "USER" } });
  customer2 = await prisma.user.upsert({ where: { email: "w7_cust2@test.com" }, update: { role: "USER" }, create: { email: "w7_cust2@test.com", password: hash, name: "Customer2", role: "USER" } });
  adminToken = makeToken(admin);
  customerToken = makeToken(customer);
  customer2Token = makeToken(customer2);
  const cat = await prisma.category.findFirst();
  product = await prisma.product.create({ data: { name: "W7 Test Product", price: 20.00, stock: 5, categoryId: cat.id } });
}

async function cleanup() {
  await prisma.orderItem.deleteMany({ where: { order: { userId: { in: [customer.id, customer2.id] } } } }).catch(() => {});
  await prisma.order.deleteMany({ where: { userId: { in: [customer.id, customer2.id] } } }).catch(() => {});
  await prisma.cartItem.deleteMany({ where: { cart: { userId: { in: [customer.id, customer2.id] } } } }).catch(() => {});
  await prisma.cart.deleteMany({ where: { userId: { in: [customer.id, customer2.id] } } }).catch(() => {});
  await prisma.product.delete({ where: { id: product.id } }).catch(() => {});
  await prisma.user.deleteMany({ where: { email: { in: ["w7_admin@test.com", "w7_cust@test.com", "w7_cust2@test.com"] } } }).catch(() => {});
}

let passed = 0; let failed = 0;
function assert(label, got, expected) {
  const ok = JSON.stringify(got) === JSON.stringify(expected);
  console.log(`  ${ok ? "✅" : "❌"} ${label}: ${JSON.stringify(got)}${ok ? "" : ` !== ${JSON.stringify(expected)}`}`);
  ok ? passed++ : failed++;
}

async function run() {
  console.log("\n════════════════════════════════════════");
  console.log("         WEEK 7 FULL TEST SUITE");
  console.log("════════════════════════════════════════\n");
  await setup();

  // ── 1. AUTH TESTING ────────────────────────────────────────────────────────
  console.log("🔐 1. Authentication");

  const reg1 = await fetch(`${BASE}/api/auth/register`, { method: "POST", headers: h(), body: j({ email: `reg_${Date.now()}@x.com`, password: "123456", name: "New User" }) });
  assert("Valid registration → 201", reg1.status, 201);

  const reg2 = await fetch(`${BASE}/api/auth/register`, { method: "POST", headers: h(), body: j({ email: "w7_admin@test.com", password: "123456" }) });
  assert("Duplicate email → 409", reg2.status, 409);

  const reg3 = await fetch(`${BASE}/api/auth/register`, { method: "POST", headers: h(), body: j({ password: "123456" }) });
  assert("Missing email → 422", reg3.status, 422);

  const reg4 = await fetch(`${BASE}/api/auth/register`, { method: "POST", headers: h(), body: j({ email: "x@x.com" }) });
  assert("Missing password → 422", reg4.status, 422);

  const reg5 = await fetch(`${BASE}/api/auth/register`, { method: "POST", headers: h(), body: j({ email: "x@x.com", password: "123" }) });
  assert("Short password (<6) → 422", reg5.status, 422);

  const login1 = await fetch(`${BASE}/api/auth/login`, { method: "POST", headers: h(), body: j({ email: "w7_admin@test.com", password: "testpass123" }) });
  assert("Valid login → 200", login1.status, 200);
  const loginData = await login1.json();
  assert("Login returns token", typeof loginData.token, "string");
  assert("Login returns user.role", loginData.user?.role, "ADMIN");

  const login2 = await fetch(`${BASE}/api/auth/login`, { method: "POST", headers: h(), body: j({ email: "w7_admin@test.com", password: "wrongpass" }) });
  assert("Wrong password → 401", login2.status, 401);

  const login3 = await fetch(`${BASE}/api/auth/login`, { method: "POST", headers: h(), body: j({ email: "w7_admin@test.com" }) });
  assert("Missing password in login → 422", login3.status, 422);

  // ── 2. AUTHORIZATION TESTING ───────────────────────────────────────────────
  console.log("\n🛡  2. Authorization");
  const aPost = await fetch(`${BASE}/api/products`, { method: "POST", headers: h(), body: j({ name: "x", price: 1, stock: 1, categoryId: 1 }) });
  assert("No token → 401", aPost.status, 401);
  const cPost = await fetch(`${BASE}/api/products`, { method: "POST", headers: h(customerToken), body: j({ name: "x", price: 1, stock: 1, categoryId: product.categoryId }) });
  assert("CUSTOMER → admin route → 403", cPost.status, 403);
  const aPost2 = await fetch(`${BASE}/api/products`, { method: "POST", headers: h(adminToken), body: j({ name: "Auth Test Prod", price: 5, stock: 1, categoryId: product.categoryId }) });
  assert("ADMIN → admin route → 201", aPost2.status, 201);
  const tempProd = (await aPost2.json()).product;
  await prisma.product.delete({ where: { id: tempProd.id } }).catch(() => {});

  // ── 3. PRODUCT VALIDATION ──────────────────────────────────────────────────
  console.log("\n📦 3. Product Validation");
  const pv1 = await fetch(`${BASE}/api/products`, { method: "POST", headers: h(adminToken), body: j({ price: 10, stock: 5, categoryId: product.categoryId }) });
  assert("Missing name → 422", pv1.status, 422);
  const pv2 = await fetch(`${BASE}/api/products`, { method: "POST", headers: h(adminToken), body: j({ name: "P", price: -5, stock: 5, categoryId: product.categoryId }) });
  assert("Negative price → 422", pv2.status, 422);
  const pv3 = await fetch(`${BASE}/api/products`, { method: "POST", headers: h(adminToken), body: j({ name: "P", price: 10, stock: -1, categoryId: product.categoryId }) });
  assert("Negative stock → 422", pv3.status, 422);
  const pv4 = await fetch(`${BASE}/api/products`, { method: "POST", headers: h(adminToken), body: j({ name: "P", price: 10, stock: 5 }) });
  assert("Missing categoryId → 422", pv4.status, 422);

  // ── 4. CATEGORY VALIDATION ─────────────────────────────────────────────────
  console.log("\n🗂  4. Category Validation");
  const cv1 = await fetch(`${BASE}/api/categories`, { method: "POST", headers: h(adminToken), body: j({}) });
  assert("Missing category name → 422", cv1.status, 422);
  const cv2 = await fetch(`${BASE}/api/categories`, { method: "POST", headers: h(adminToken), body: j({ name: "   " }) });
  assert("Blank category name → 422", cv2.status, 422);

  // ── 5. CART TESTING ────────────────────────────────────────────────────────
  console.log("\n🛒 5. Cart Validation & Flow");
  const cv_noauth = await fetch(`${BASE}/api/cart`, { headers: h() });
  assert("GET cart no token → 401", cv_noauth.status, 401);
  const cv_qty0 = await fetch(`${BASE}/api/cart/items`, { method: "POST", headers: h(customerToken), body: j({ productId: product.id, quantity: 0 }) });
  assert("quantity=0 → 422", cv_qty0.status, 422);
  const cv_negqty = await fetch(`${BASE}/api/cart/items`, { method: "POST", headers: h(customerToken), body: j({ productId: product.id, quantity: -1 }) });
  assert("quantity=-1 → 422", cv_negqty.status, 422);
  const cv_noprod = await fetch(`${BASE}/api/cart/items`, { method: "POST", headers: h(customerToken), body: j({ productId: 999999, quantity: 1 }) });
  assert("Non-existent product → 400", cv_noprod.status, 400);
  const cv_stock = await fetch(`${BASE}/api/cart/items`, { method: "POST", headers: h(customerToken), body: j({ productId: product.id, quantity: 100 }) });
  assert("Insufficient stock → 400", cv_stock.status, 400);

  // Cart full flow
  const addR = await fetch(`${BASE}/api/cart/items`, { method: "POST", headers: h(customerToken), body: j({ productId: product.id, quantity: 1 }) });
  assert("Add to cart → 200", addR.status, 200);
  const cartR = await fetch(`${BASE}/api/cart`, { headers: h(customerToken) });
  assert("GET cart → 200", cartR.status, 200);
  const cart = (await cartR.json()).cart;
  assert("Cart has 1 item", cart.items.length, 1);
  const itemId = cart.items[0].id;
  const updR = await fetch(`${BASE}/api/cart/items/${itemId}`, { method: "PUT", headers: h(customerToken), body: j({ quantity: 2 }) });
  assert("Update cart item → 200", updR.status, 200);
  const delR = await fetch(`${BASE}/api/cart/items/${itemId}`, { method: "DELETE", headers: h(customerToken) });
  assert("Remove cart item → 200", delR.status, 200);
  const emptyCart = await fetch(`${BASE}/api/cart`, { headers: h(customerToken) });
  const emptyCartData = (await emptyCart.json()).cart;
  assert("Cart empty after remove", emptyCartData.items.length, 0);

  // Another user's cart item
  await fetch(`${BASE}/api/cart/items`, { method: "POST", headers: h(customer2Token), body: j({ productId: product.id, quantity: 1 }) });
  const c2Cart = await fetch(`${BASE}/api/cart`, { headers: h(customer2Token) });
  const c2ItemId = (await c2Cart.json()).cart.items[0]?.id;
  if (c2ItemId) {
    const crossCart = await fetch(`${BASE}/api/cart/items/${c2ItemId}`, { method: "DELETE", headers: h(customerToken) });
    assert("Customer1 delete customer2 cart item → 403 or 404", [403, 404].includes(crossCart.status), true);
  }

  // ── 6. CHECKOUT TESTING ────────────────────────────────────────────────────
  console.log("\n🧾 6. Checkout Testing");
  // Add item for checkout
  await fetch(`${BASE}/api/cart/items`, { method: "POST", headers: h(customerToken), body: j({ productId: product.id, quantity: 2 }) });
  const stockBefore = (await prisma.product.findUnique({ where: { id: product.id } })).stock;

  const checkoutR = await fetch(`${BASE}/api/orders`, { method: "POST", headers: h(customerToken) });
  assert("Checkout → 201", checkoutR.status, 201);
  const order = (await checkoutR.json()).order;
  assert("Order has userId", order.userId, customer.id);
  assert("Order status = PENDING", order.status, "PENDING");
  assert("Order has items", order.items.length > 0, true);
  assert("OrderItem has snapshot price", typeof order.items[0].price, "number");

  const stockAfter = (await prisma.product.findUnique({ where: { id: product.id } })).stock;
  assert("Stock decremented by 2", stockAfter, stockBefore - 2);

  const postCart = await fetch(`${BASE}/api/cart`, { headers: h(customerToken) });
  assert("Cart cleared after checkout", (await postCart.json()).cart.items.length, 0);

  // ── 7. FAILED CHECKOUT (Transaction Test) ─────────────────────────────────
  console.log("\n💥 7. Failed Checkout (Transaction)");
  // Set stock to 2, request 5
  await prisma.product.update({ where: { id: product.id }, data: { stock: 2 } });
  await fetch(`${BASE}/api/cart/items`, { method: "POST", headers: h(customerToken), body: j({ productId: product.id, quantity: 2 }) });
  // Now manually set stock to 1 to simulate race condition after add
  await prisma.product.update({ where: { id: product.id }, data: { stock: 1 } });

  const failCheckout = await fetch(`${BASE}/api/orders`, { method: "POST", headers: h(customerToken) });
  assert("Insufficient stock at checkout → 400", failCheckout.status, 400);

  const cartAfterFail = await fetch(`${BASE}/api/cart`, { headers: h(customerToken) });
  assert("Cart NOT cleared on failed checkout", (await cartAfterFail.json()).cart.items.length > 0, true);

  const stockAfterFail = (await prisma.product.findUnique({ where: { id: product.id } })).stock;
  assert("Stock NOT decremented on failed checkout", stockAfterFail, 1);

  // Restore stock and clear cart for order tests
  await prisma.product.update({ where: { id: product.id }, data: { stock: 10 } });
  await prisma.cartItem.deleteMany({ where: { cart: { userId: customer.id } } });

  // ── 8. ORDER PERMISSIONS ───────────────────────────────────────────────────
  console.log("\n🔒 8. Order Permissions");
  // Make order for customer
  await fetch(`${BASE}/api/cart/items`, { method: "POST", headers: h(customerToken), body: j({ productId: product.id, quantity: 1 }) });
  const myOrderR = await fetch(`${BASE}/api/orders`, { method: "POST", headers: h(customerToken) });
  const myOrder = (await myOrderR.json()).order;

  // Customer sees only own orders
  const custOrders = await fetch(`${BASE}/api/orders`, { headers: h(customerToken) });
  const custOrderList = (await custOrders.json()).orders;
  assert("Customer GET /orders → 200", custOrders.status, 200);
  assert("Customer sees only own orders", custOrderList.every(o => o.userId === customer.id), true);

  // Customer cannot view another's order
  const custViewOther = await fetch(`${BASE}/api/orders/${myOrder.id}`, { headers: h(customer2Token) });
  assert("Customer2 view Customer1 order → 403", custViewOther.status, 403);

  // Admin sees ALL orders (includes user field)
  const adminOrders = await fetch(`${BASE}/api/orders`, { headers: h(adminToken) });
  const adminOrderList = (await adminOrders.json()).orders;
  assert("Admin GET /orders → 200", adminOrders.status, 200);
  assert("Admin sees all orders with user info", adminOrderList[0]?.user !== undefined, true);

  // ── 9. ORDER STATUS TESTING ────────────────────────────────────────────────
  console.log("\n📋 9. Order Status");

  // Invalid status value
  const badStatus = await fetch(`${BASE}/api/orders/${myOrder.id}/status`, { method: "PATCH", headers: h(adminToken), body: j({ status: "HELLO" }) });
  assert("Invalid status value → 422", badStatus.status, 422);

  // Missing status field
  const noStatus = await fetch(`${BASE}/api/orders/${myOrder.id}/status`, { method: "PATCH", headers: h(adminToken), body: j({}) });
  assert("Missing status field → 422", noStatus.status, 422);

  // Valid transition: PENDING → CONFIRMED
  const s1 = await fetch(`${BASE}/api/orders/${myOrder.id}/status`, { method: "PATCH", headers: h(adminToken), body: j({ status: "CONFIRMED" }) });
  assert("PENDING → CONFIRMED → 200", s1.status, 200);
  assert("Status is CONFIRMED", (await s1.json()).order.status, "CONFIRMED");

  // Valid: CONFIRMED → PROCESSING
  const s2 = await fetch(`${BASE}/api/orders/${myOrder.id}/status`, { method: "PATCH", headers: h(adminToken), body: j({ status: "PROCESSING" }) });
  assert("CONFIRMED → PROCESSING → 200", s2.status, 200);

  // Invalid transition: PROCESSING → PENDING
  const s3 = await fetch(`${BASE}/api/orders/${myOrder.id}/status`, { method: "PATCH", headers: h(adminToken), body: j({ status: "PENDING" }) });
  assert("PROCESSING → PENDING (illegal) → 400", s3.status, 400);

  // Valid statuses: SHIPPED, DELIVERED
  const s4 = await fetch(`${BASE}/api/orders/${myOrder.id}/status`, { method: "PATCH", headers: h(adminToken), body: j({ status: "SHIPPED" }) });
  assert("PROCESSING → SHIPPED → 200", s4.status, 200);
  const s5 = await fetch(`${BASE}/api/orders/${myOrder.id}/status`, { method: "PATCH", headers: h(adminToken), body: j({ status: "DELIVERED" }) });
  assert("SHIPPED → DELIVERED → 200", s5.status, 200);

  // Terminal: DELIVERED → CANCELLED
  const s6 = await fetch(`${BASE}/api/orders/${myOrder.id}/status`, { method: "PATCH", headers: h(adminToken), body: j({ status: "CANCELLED" }) });
  assert("DELIVERED (terminal) → 400", s6.status, 400);

  // Customer cannot update status
  const s7 = await fetch(`${BASE}/api/orders/${myOrder.id}/status`, { method: "PATCH", headers: h(customerToken), body: j({ status: "CANCELLED" }) });
  assert("CUSTOMER update status → 403", s7.status, 403);

  // ── Results ────────────────────────────────────────────────────────────────
  await cleanup();
  console.log(`\n✅ Cleanup done.\n`);
  console.log("════════════════════════════════════════");
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log("════════════════════════════════════════");
  if (failed === 0) {
    console.log("\n🎉 ALL WEEK 7 TESTS PASSED!\n");
  } else {
    console.log("\n❌ SOME TESTS FAILED — see above for details\n");
    process.exitCode = 1;
  }
  await prisma.$disconnect();
}

run().catch(async (e) => {
  console.error("Fatal:", e.message, e.stack);
  await cleanup().catch(() => {});
  await prisma.$disconnect();
  process.exitCode = 1;
});
