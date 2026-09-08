"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { orderApi, Order } from "../../lib/api";
import { useAuth } from "../../hooks/useAuth";

export default function OrdersPage() {
  const { isLoggedIn, loading: authLoading } = useAuth(true);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn) return;

    async function fetchOrders() {
      try {
        setLoading(true);
        setError(null);
        const data = await orderApi.getUserOrders();
        setOrders(data);
      } catch (err: any) {
        console.error("Error fetching orders:", err);
        setError(err.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [isLoggedIn]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-gray-500 font-medium">Loading your orders...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null; // Handled by useAuth guard
  }

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "DELIVERED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "SHIPPED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "PROCESSING":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-purple-100 text-purple-800 border-purple-200"; // PENDING
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Order History</h1>
        <p className="mt-2 text-sm text-gray-500">
          Check the status of recent orders, manage returns, and view receipts.
        </p>
      </div>

      {error && (
        <div className="mt-6 rounded-md bg-red-50 p-4 border border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h2 className="mt-4 text-lg font-semibold text-gray-900">No orders placed yet</h2>
          <p className="mt-1 text-sm text-gray-500">When you place an order, it will appear here.</p>
          <div className="mt-6">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xs hover:shadow-xs transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 bg-gray-50/50 p-4 sm:p-6 gap-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-8">
                  <div>
                    <span className="block text-xs text-gray-500 uppercase font-semibold">Order Placed</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  <div>
                    <span className="block text-xs text-gray-500 uppercase font-semibold">Total</span>
                    <span className="text-sm font-bold text-gray-900">${Number(order.totalAmount).toFixed(2)}</span>
                  </div>

                  <div>
                    <span className="block text-xs text-gray-500 uppercase font-semibold">Order #</span>
                    <span className="text-sm font-mono font-medium text-gray-900">#{order.id}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold border ${getStatusBadge(order.status)}`}
                  >
                    {order.status}
                  </span>

                  <Link
                    href={`/orders/${order.id}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs"
                  >
                    View Order Details &rarr;
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
