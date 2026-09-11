"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { orderApi, Order } from "../../lib/api";
import { useAuth } from "../../hooks/useAuth";

export default function OrdersPage() {
  const { isLoggedIn, loading: authLoading } = useAuth(true);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isLoggedIn) return;

    async function loadOrders() {
      try {
        setLoading(true);

        // Fetch from backend API (primary source of truth)
        try {
          const apiOrders = await orderApi.getUserOrders();
          if (Array.isArray(apiOrders)) {
            setOrders(apiOrders);
            return;
          }
        } catch {
          // Backend offline or error -> use user's local orders as fallback
        }

        // Fallback: load from per-user localStorage
        let localUserOrders: Order[] = [];
        if (typeof window !== "undefined") {
          const userEmail = (localStorage.getItem("userEmail") || "default").toLowerCase();
          const storedOrdersRaw = localStorage.getItem(`orders_${userEmail}`);
          if (storedOrdersRaw) {
            try {
              localUserOrders = JSON.parse(storedOrdersRaw);
            } catch {
              localUserOrders = [];
            }
          }
        }

        // For a new registered user with no orders, this is an empty array []
        setOrders(localUserOrders);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [isLoggedIn]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-900 border-t-transparent"></div>
        <p className="text-slate-500 font-medium text-sm">Loading your orders...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-10 sm:py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              My Orders
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Track delivery progress and view past receipts.
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-slate-800 transition-all shadow-sm self-start sm:self-auto"
          >
            Shop More
          </Link>
        </div>

        {/* Empty State for New User / No Orders */}
        {orders.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 sm:p-16 text-center shadow-2xs space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mx-auto">
              <i className="bi bi-bag-x text-3xl"></i>
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                You haven&apos;t placed any orders yet.
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                Explore our catalog and find great deals to place your first order.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-xs sm:text-sm font-bold text-white hover:bg-slate-800 transition-all shadow-sm"
              >
                Browse Products
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-5"
              >
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 text-xs">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">Order #{order.id}</span>
                    <span className="text-slate-400 ml-2">
                      &bull; Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full font-bold uppercase text-[10px] ${
                        order.status.toUpperCase() === "DELIVERED"
                          ? "bg-emerald-50 text-emerald-700"
                          : order.status.toUpperCase() === "SHIPPED"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {order.status}
                    </span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      ${Number(order.totalAmount).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  {order.items?.map((item) => (
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
                          <h4 className="text-xs font-bold text-slate-800">
                            {item.product?.name}
                          </h4>
                          <p className="text-[11px] text-slate-400">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-slate-900">
                        ${(Number(item.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Bottom links */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-4">
                  <Link
                    href={`/orders/${order.id}`}
                    className="text-xs font-bold text-slate-900 hover:underline flex items-center gap-1"
                  >
                    View Details &rarr;
                  </Link>
                  <Link
                    href={`/orders/success/${order.id}`}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1"
                  >
                    Receipt
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
