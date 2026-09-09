"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { orderApi, cartApi, Order } from "../../lib/api";

export default function CheckoutPage() {
  const router = useRouter();
  const { isLoggedIn, loading: authLoading } = useAuth(true);
  const { cart, loading: cartLoading, clearCart } = useCart();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
    paymentMethod: "cod",
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("userName") || "";
      const savedEmail = localStorage.getItem("userEmail") || "";
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || savedName,
        email: prev.email || savedEmail || "user@shopease.com",
      }));
    }
  }, []);

  if (authLoading || cartLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-900 border-t-transparent"></div>
        <p className="text-slate-500 font-medium text-sm">Preparing checkout...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null; // Handled by useAuth guard
  }

  const items = cart?.items || [];
  const subtotal = cart?.total || 0;
  const shippingFee = 0; // Free Shipping
  const total = subtotal + shippingFee;

  // Empty cart guard
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#f8fafc] py-16">
        <div className="mx-auto max-w-xl px-4 text-center">
          <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-2xs space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <i className="bi bi-cart-x text-3xl"></i>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Your Cart is Empty</h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              You must add products to your cart before proceeding to checkout.
            </p>
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-xs sm:text-sm font-bold text-white hover:bg-slate-800 transition-all shadow-sm"
              >
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: false }));
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const errors: { [key: string]: boolean } = {};
    if (!formData.fullName.trim()) errors.fullName = true;
    if (!formData.address.trim()) errors.address = true;
    if (!formData.city.trim()) errors.city = true;
    if (!formData.phone.trim()) errors.phone = true;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage("Please complete all required fields highlighted in red.");
      return;
    }

    try {
      setSubmitting(true);

      // 1. Sync local cart items to backend cart if backend cart is currently empty
      try {
        const currentBackendCart = await cartApi.getCart();
        if ((!currentBackendCart?.items || currentBackendCart.items.length === 0) && items.length > 0) {
          for (const item of items) {
            if (item.product?.id) {
              await cartApi.addToCart(item.product.id, item.quantity);
            }
          }
        }
      } catch (syncErr: any) {
        if (syncErr?.message === "User not found" || syncErr?.message?.includes("token") || syncErr?.message?.includes("Authentication")) {
          throw new Error("Your session has expired or user was not found. Please log in again.");
        }
        console.warn("Backend cart sync notice:", syncErr);
      }

      // 2. Create order via Backend API (creates order with authenticated user ID & saves to DB)
      let createdOrder: any = null;
      try {
        createdOrder = await orderApi.createOrder(formData);
      } catch (apiErr: any) {
        // If server is reachable and returned a message, throw it to inform user
        if (apiErr?.message && !apiErr.message.includes("Failed to fetch")) {
          throw apiErr;
        }
        console.warn("Backend API offline during checkout, fallback local creation:", apiErr?.message);
      }

      const orderId = createdOrder?.id || Math.floor(1000 + Math.random() * 9000);

      // Offline fallback: save order locally only if backend is completely offline
      if (!createdOrder) {
        const newOrder: Order = {
          id: orderId,
          userId: 0,
          status: "PENDING",
          totalAmount: total,
          createdAt: new Date().toISOString(),
          items: items.map((i) => ({
            id: i.id,
            quantity: i.quantity,
            price: i.product.price,
            product: {
              id: i.product.id,
              name: i.product.name,
              imageUrl: i.product.imageUrl,
            },
          })),
          shippingInfo: {
            fullName: formData.fullName,
            address: formData.address,
            city: formData.city,
            postalCode: formData.postalCode,
            phone: formData.phone,
          },
        };

        if (typeof window !== "undefined") {
          const userEmail = (localStorage.getItem("userEmail") || formData.email || "default").toLowerCase();
          const userKey = `orders_${userEmail}`;
          const storedOrdersRaw = localStorage.getItem(userKey);
          const storedOrders = storedOrdersRaw ? JSON.parse(storedOrdersRaw) : [];
          storedOrders.unshift(newOrder);
          localStorage.setItem(userKey, JSON.stringify(storedOrders));
        }
      }

      // 3. Clear cart after successful order creation
      clearCart();

      // 4. Redirect to Order Success Page
      router.push(`/orders/success/${orderId}`);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header & Breadcrumbs */}
        <div className="space-y-1">
          <nav className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/cart" className="hover:text-slate-900">Cart</Link>
            <span>&gt;</span>
            <span className="font-semibold text-slate-800">Checkout</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Checkout
          </h1>
        </div>

        {errorMessage && (
          <div className="flex items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs sm:text-sm text-red-700 font-medium">
            <i className="bi bi-exclamation-triangle-fill text-red-500"></i>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ─── LEFT: SHIPPING & PAYMENT FORM ─── */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Contact & Shipping Address Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white text-xs font-bold">
                  1
                </div>
                <h2 className="text-base font-bold text-slate-900">
                  Shipping Details
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className={`w-full h-11 px-3.5 rounded-xl border bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none shadow-2xs ${
                      fieldErrors.fullName ? "border-rose-400 focus:border-rose-500 bg-rose-50/30" : "border-slate-200 focus:border-slate-400"
                    }`}
                  />
                  {fieldErrors.fullName && (
                    <span className="text-[11px] text-rose-500">Full name is required.</span>
                  )}
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Street Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="House number and street name"
                    className={`w-full h-11 px-3.5 rounded-xl border bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none shadow-2xs ${
                      fieldErrors.address ? "border-rose-400 focus:border-rose-500 bg-rose-50/30" : "border-slate-200 focus:border-slate-400"
                    }`}
                  />
                  {fieldErrors.address && (
                    <span className="text-[11px] text-rose-500">Street address is required.</span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Phnom Penh"
                    className={`w-full h-11 px-3.5 rounded-xl border bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none shadow-2xs ${
                      fieldErrors.city ? "border-rose-400 focus:border-rose-500 bg-rose-50/30" : "border-slate-200 focus:border-slate-400"
                    }`}
                  />
                  {fieldErrors.city && (
                    <span className="text-[11px] text-rose-500">City is required.</span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    placeholder="12000"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 shadow-2xs"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+855 12 345 678"
                    className={`w-full h-11 px-3.5 rounded-xl border bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none shadow-2xs ${
                      fieldErrors.phone ? "border-rose-400 focus:border-rose-500 bg-rose-50/30" : "border-slate-200 focus:border-slate-400"
                    }`}
                  />
                  {fieldErrors.phone && (
                    <span className="text-[11px] text-rose-500">Phone number is required.</span>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Payment Method Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white text-xs font-bold">
                  2
                </div>
                <h2 className="text-base font-bold text-slate-900">
                  Payment Method
                </h2>
              </div>

              <div className="space-y-3 pt-1">
                <label className="flex items-center justify-between p-4 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === "cod"}
                      onChange={handleChange}
                      className="h-4 w-4 text-slate-900 border-slate-300 focus:ring-0"
                    />
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">Cash on Delivery (COD)</span>
                      <span className="text-xs text-slate-500">Pay cash upon receiving your order</span>
                    </div>
                  </div>
                  <i className="bi bi-cash text-xl text-slate-700"></i>
                </label>

                <label className="flex items-center justify-between p-4 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === "card"}
                      onChange={handleChange}
                      className="h-4 w-4 text-slate-900 border-slate-300 focus:ring-0"
                    />
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">Credit / Debit Card</span>
                      <span className="text-xs text-slate-500">Instant secure online checkout</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <i className="bi bi-credit-card text-lg"></i>
                  </div>
                </label>
              </div>
            </div>

          </div>

          {/* ─── RIGHT: ORDER SUMMARY CARD ─── */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-6">
            <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Order Summary ({items.length} items)
            </h2>

            {/* Items list */}
            <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 rounded-lg overflow-hidden bg-slate-50 border border-slate-100">
                      {item.product?.imageUrl && (
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          fill
                          className="object-contain p-1"
                        />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-800 line-clamp-1">
                        {item.product?.name}
                      </h4>
                      <p className="text-[11px] text-slate-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Pricing details */}
            <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs sm:text-sm">
              <div className="flex items-center justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Shipping</span>
                <span className="font-semibold text-emerald-600">Free</span>
              </div>
              <div className="flex items-center justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-100">
                <span>Total</span>
                <span className="text-xl">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-[#0f172a] text-sm font-bold text-white hover:bg-slate-800 transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50"
            >
              <i className="bi bi-lock-fill text-sm"></i>
              {submitting ? "Placing Order..." : `Place Order — $${total.toFixed(2)}`}
            </button>

            {/* Trust badge icons */}
            <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <i className="bi bi-shield-check text-slate-700"></i>
                SSL Encrypted
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <i className="bi bi-arrow-counterclockwise text-slate-700"></i>
                30-Day Returns
              </span>
            </div>

          </div>

        </form>

      </div>
    </div>
  );
}
