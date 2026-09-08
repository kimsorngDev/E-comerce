"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { orderApi } from "../../lib/api";

export default function CheckoutPage() {
  const router = useRouter();
  const { isLoggedIn, loading: authLoading } = useAuth(true);
  const { cart, loading: cartLoading, fetchCart } = useCart();

  const [formData, setFormData] = useState({
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
    paymentMethod: "cod",
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (authLoading || cartLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-gray-500 font-medium">Preparing checkout...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null; // Handled by useAuth
  }

  const items = cart?.items || [];
  const subtotal = cart?.total || 0;
  const shippingFee = subtotal > 0 ? (subtotal > 100 ? 0 : 10) : 0;
  const total = subtotal + shippingFee;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Your Cart is Empty</h1>
          <p className="mt-2 text-gray-500">You must add items to your cart before proceeding to checkout.</p>
          <div className="mt-6">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.address || !formData.city || !formData.phone) {
      setErrorMessage("Please fill in all required shipping fields.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage(null);

      const order = await orderApi.createOrder(formData);

      // Trigger cart refresh event to sync global cart state
      await fetchCart();

      // Redirect to Order Success Page
      router.push(`/orders/success/${order.id}`);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">Checkout</h1>

      {errorMessage && (
        <div className="mt-6 rounded-md bg-red-50 p-4 border border-red-200">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Checkout Error</h3>
              <div className="mt-1 text-sm text-red-700">{errorMessage}</div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
        {/* Checkout Form */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Shipping Info Section */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
              <h2 className="text-lg font-semibold text-gray-900">Shipping Information</h2>

              <div className="mt-4 grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4">
                <div className="sm:col-span-2">
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    placeholder="John Doe"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    placeholder="123 Main St, Apt 4B"
                  />
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    placeholder="Phnom Penh"
                  />
                </div>

                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                    Postal Code / Zip
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    placeholder="12000"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                    placeholder="+855 12 345 678"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
              <h2 className="text-lg font-semibold text-gray-900">Payment Method</h2>
              <div className="mt-4 space-y-3">
                <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === "cod"}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="block font-medium text-gray-900 text-sm">Cash on Delivery (COD)</span>
                    <span className="block text-xs text-gray-500">Pay cash upon item receipt</span>
                  </div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-blue-600 py-3.5 px-6 font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {submitting ? "Processing Order..." : `Place Order ($${total.toFixed(2)})`}
            </button>
          </form>
        </div>

        {/* Order Summary Sidebar */}
        <div className="mt-10 lg:col-span-5 lg:mt-0">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-xs">
            <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>

            <ul role="list" className="mt-4 divide-y divide-gray-200 max-h-80 overflow-y-auto">
              {items.map((item) => (
                <li key={item.id} className="flex py-3 items-center">
                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-white">
                    <Image
                      src={item.product?.imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80"}
                      alt={item.product?.name || "Product"}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        // Fallback image on error
                        (e.target as any).src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80";
                      }}
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-xs font-semibold text-gray-900 line-clamp-1">{item.product?.name}</h3>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-xs font-semibold text-gray-900">
                    ${(Number(item.product?.price || 0) * item.quantity).toFixed(2)}
                  </p>
                </li>
              ))}
            </ul>

            <dl className="mt-6 space-y-3 border-t border-gray-200 pt-4 text-xs">
              <div className="flex justify-between">
                <dt className="text-gray-600">Subtotal</dt>
                <dd className="font-semibold text-gray-900">${subtotal.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Shipping</dt>
                <dd className="font-semibold text-gray-900">
                  {shippingFee === 0 ? "FREE" : `$${shippingFee.toFixed(2)}`}
                </dd>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-3 text-sm font-bold text-gray-900">
                <dt>Total</dt>
                <dd className="text-blue-600 text-base">${total.toFixed(2)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
