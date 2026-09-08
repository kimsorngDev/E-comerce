import "dotenv/config";
import app from "../app.js";
import prisma from "../src/config/database.js";
import jwt from "jsonwebtoken";

async function runTests() {
  console.log("--- Starting Order Flow Integration Tests ---");
  let server;

  try {
    // 1. Setup Test Server
    server = app.listen(5001);
    const baseUrl = "http://localhost:5001";

    // 2. Setup Test User
    const testEmail = `order_test_${Date.now()}@example.com`;
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password: "hashedpassword123",
        name: "Order Test User",
      },
    });
    console.log("✅ Created Test User ID:", user.id);

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "idontwanttostudyiwanttosleepZzz"
    );
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    // 3. Setup Test Category and Product
    const category = await prisma.category.upsert({
      where: { name: "Test Order Category" },
      update: {},
      create: { name: "Test Order Category" },
    });

    const initialPrice = 49.99;
    const initialStock = 10;
    const product = await prisma.product.create({
      data: {
        name: "Test Order Headphones",
        description: "High quality noise cancelling headphones",
        price: initialPrice,
        stock: initialStock,
        categoryId: category.id,
      },
    });
    console.log("✅ Created Test Product ID:", product.id, "Price:", initialPrice, "Stock:", initialStock);

    // 4. Test Error Case: POST /api/orders with empty cart
    const emptyCheckoutRes = await fetch(`${baseUrl}/api/orders`, {
      method: "POST",
      headers,
    });
    const emptyCheckoutData = await emptyCheckoutRes.json();
    console.log("✅ Empty cart checkout status:", emptyCheckoutRes.status, "| Message:", emptyCheckoutData.message);
    if (emptyCheckoutRes.status !== 400 || emptyCheckoutData.message !== "Cart is empty") {
      throw new Error("Failed empty cart validation test");
    }

    // 5. Add product to cart
    const addToCartRes = await fetch(`${baseUrl}/api/cart/items`, {
      method: "POST",
      headers,
      body: JSON.stringify({ productId: product.id, quantity: 2 }),
    });
    const addToCartData = await addToCartRes.json();
    console.log("✅ Added product to cart. Cart total:", addToCartData.cart?.total);

    // 6. Test Checkout: POST /api/orders
    const checkoutRes = await fetch(`${baseUrl}/api/orders`, {
      method: "POST",
      headers,
    });
    const checkoutData = await checkoutRes.json();
    console.log("✅ Order Checkout status:", checkoutRes.status, "| Order ID:", checkoutData.order?.id, "| Total:", checkoutData.order?.totalAmount);
    
    if (checkoutRes.status !== 201 || !checkoutData.order?.id) {
      throw new Error(`Checkout failed: ${JSON.stringify(checkoutData)}`);
    }

    const orderId = checkoutData.order.id;

    // 7. Verify Cart is Cleared after checkout
    const cartRes = await fetch(`${baseUrl}/api/cart`, {
      method: "GET",
      headers,
    });
    const cartData = await cartRes.json();
    console.log("✅ Cart items after checkout:", cartData.cart?.items?.length);
    if (cartData.cart?.items?.length !== 0) {
      throw new Error("Cart was not cleared after checkout");
    }

    // 8. Verify Stock Reduction
    const updatedProduct = await prisma.product.findUnique({ where: { id: product.id } });
    console.log("✅ Stock after purchase of 2 units:", updatedProduct.stock, "(Expected:", initialStock - 2, ")");
    if (updatedProduct.stock !== initialStock - 2) {
      throw new Error("Stock was not properly decremented");
    }

    // 9. Test GET /api/orders
    const getOrdersRes = await fetch(`${baseUrl}/api/orders`, {
      method: "GET",
      headers,
    });
    const getOrdersData = await getOrdersRes.json();
    console.log("✅ GET /api/orders total count:", getOrdersData.orders?.length);
    if (!getOrdersData.orders || getOrdersData.orders.length === 0) {
      throw new Error("GET /api/orders returned no orders");
    }

    // 10. Test GET /api/orders/:id
    const getOrderRes = await fetch(`${baseUrl}/api/orders/${orderId}`, {
      method: "GET",
      headers,
    });
    const getOrderData = await getOrderRes.json();
    console.log("✅ GET /api/orders/:id item unit price:", getOrderData.order?.items[0]?.price);

    // 11. Test Price Snapshot Preservation: Update product price in database
    await prisma.product.update({
      where: { id: product.id },
      data: { price: 999.99 },
    });
    console.log("✅ Updated product price in database to $999.99");

    const reFetchOrderRes = await fetch(`${baseUrl}/api/orders/${orderId}`, {
      method: "GET",
      headers,
    });
    const reFetchOrderData = await reFetchOrderRes.json();
    const preservedPrice = reFetchOrderData.order?.items[0]?.price;
    console.log("✅ Re-fetched Order item price:", preservedPrice, "(Original initial price:", initialPrice, ")");

    if (preservedPrice !== initialPrice) {
      throw new Error(`Price snapshot failed! Expected ${initialPrice}, got ${preservedPrice}`);
    }

    // 12. Test Unauthorized & 404 Error Cases
    const unauthRes = await fetch(`${baseUrl}/api/orders`, { method: "GET" });
    console.log("✅ Unauthenticated request status:", unauthRes.status, "(Expected: 401)");
    if (unauthRes.status !== 401) throw new Error("Failed unauthenticated test");

    const notFoundRes = await fetch(`${baseUrl}/api/orders/999999`, {
      method: "GET",
      headers,
    });
    console.log("✅ Non-existent order status:", notFoundRes.status, "(Expected: 404)");
    if (notFoundRes.status !== 404) throw new Error("Failed 404 order test");

    // 13. Clean up test data
    await prisma.orderItem.deleteMany({ where: { orderId } });
    await prisma.order.delete({ where: { id: orderId } });
    await prisma.cartItem.deleteMany({ where: { cart: { userId: user.id } } });
    await prisma.cart.deleteMany({ where: { userId: user.id } });
    await prisma.product.delete({ where: { id: product.id } });
    await prisma.user.delete({ where: { id: user.id } });
    console.log("✅ Cleaned up test data.");

    console.log("\n🎉 ALL ORDER FLOW INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉");

  } catch (error) {
    console.error("❌ Test error:", error);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
    await prisma.$disconnect();
  }
}

runTests();
