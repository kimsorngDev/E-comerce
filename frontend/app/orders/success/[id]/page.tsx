"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { orderApi, Order } from "../../../../lib/api";
import { useAuth } from "../../../../hooks/useAuth";

export default function OrderSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;
  const { isLoggedIn, loading: authLoading } = useAuth(true);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId || !isLoggedIn) return;

    async function fetchOrderDetails() {
      try {
        setLoading(true);
        const data = await orderApi.getOrderById(orderId);
        setOrder(data);
      } catch (err: any) {
        console.error("Error loading order details:", err);
        setError(err.message || "Failed to load order details");
      } finally {
        setLoading(false);
      }
    }

    fetchOrderDetails();
  }, [orderId, isLoggedIn]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-gray-500 font-medium">Fetching order confirmation...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
          <h1 className="text-2xl font-bold text-red-800">Order Not Found</h1>
          <p className="mt-2 text-sm text-red-600">{error || "We couldn't retrieve the details for this order."}</p>
          <div className="mt-6">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Success Hero Header */}
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Order Confirmed!</h1>
        <p className="mt-2 text-base text-gray-600">
          Thank you for your purchase. Your order <span className="font-bold text-gray-900">#{order.id}</span> has been placed successfully.
        </p>
      </div>

      {/* Order Details Card */}
      <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div>
            <p className="text-xs text-gray-500">Order Number</p>
            <p className="text-lg font-bold text-gray-900">#{order.id}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Date Placed</p>
            <p className="text-sm font-medium text-gray-900">
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Purchased Items */}
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Ordered Items</h2>
          <ul role="list" className="mt-4 divide-y divide-gray-200 border-t border-b border-gray-200">
            {order.items.map((item) => (
              <li key={item.id} className="flex py-4 items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                    <Image
                      src={item.product?.imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80"}
                      alt={item.product?.name || "Product"}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        (e.target as any).src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80";
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{item.product?.name}</h3>
                    <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  ${(Number(item.price) * item.quantity).toFixed(2)}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* Pricing Summary */}
        <div className="mt-6 border-t border-gray-200 pt-4">
          <div className="flex justify-between text-sm py-1">
            <span className="text-gray-600">Total Paid</span>
            <span className="text-lg font-bold text-blue-600">${Number(order.totalAmount).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs py-1 text-gray-500">
            <span>Status</span>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-semibold text-emerald-800 uppercase">
              {order.status}
            </span>
          </div>
        </div>

        {/* Call to Actions */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
