"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { orderApi, Order } from "../../../lib/api";
import { useAuth } from "../../../hooks/useAuth";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;
  const { isLoggedIn, loading: authLoading } = useAuth(true);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId || !isLoggedIn) return;

    async function fetchDetails() {
      try {
        setLoading(true);
        setError(null);

        // 1. Try API first (source of truth)
        try {
          const data = await orderApi.getOrderById(orderId);
          if (data) {
            setOrder(data);
            return;
          }
        } catch {
          // Backend offline or error -> try local fallback
        }

        // 2. Check local per-user orders
        if (typeof window !== "undefined") {
          const userEmail = (localStorage.getItem("userEmail") || "default").toLowerCase();
          const storedOrdersRaw = localStorage.getItem(`orders_${userEmail}`);
          if (storedOrdersRaw) {
            try {
              const storedOrders: Order[] = JSON.parse(storedOrdersRaw);
              const found = storedOrders.find((o) => String(o.id) === String(orderId));
              if (found) {
                setOrder(found);
                return;
              }
            } catch {
              // ignore
            }
          }
        }
      } catch (err: any) {
        // Fallback demo order
        setOrder({
          id: Number(orderId) || 1001,
          userId: 1,
          status: "DELIVERED",
          totalAmount: 799.0,
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          items: [
            {
              id: 1,
              quantity: 1,
              price: 799.0,
              product: {
                id: 1,
                name: "iPhone 15",
                imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80",
              },
            },
          ],
          shippingInfo: {
            fullName: localStorage.getItem("userName") || "Kimsorng",
            address: "123 Norodom Blvd",
            city: "Phnom Penh",
            postalCode: "12000",
            phone: "+855 12 345 678",
          },
        });
      } finally {
        setLoading(false);
      }
    }

    fetchDetails();
  }, [orderId, isLoggedIn]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-900 border-t-transparent"></div>
        <p className="text-slate-500 font-medium text-sm">Loading order details...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 space-y-3">
          <h1 className="text-xl font-bold text-red-800">Order Not Found</h1>
          <p className="text-xs text-red-600">Unable to locate order information for #{orderId}.</p>
          <div className="pt-3">
            <Link
              href="/orders"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
            >
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-10 sm:py-14">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/orders" className="hover:text-slate-900">My Orders</Link>
          <span>&gt;</span>
          <span className="font-semibold text-slate-800">Order #{order.id}</span>
        </nav>

        {/* Main Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xs space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Order #{order.id}</h1>
              <p className="text-xs text-slate-500 mt-1">
                Placed on {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>

            <span
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase self-start sm:self-auto ${
                order.status.toUpperCase() === "DELIVERED"
                  ? "bg-emerald-50 text-emerald-700"
                  : order.status.toUpperCase() === "SHIPPED"
                  ? "bg-blue-50 text-blue-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {order.status}
            </span>
          </div>

          {/* Items Ordered */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Items Ordered
            </h3>
            <div className="divide-y divide-slate-100">
              {order.items?.map((item) => (
                <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-14 w-14 shrink-0 rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
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
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                        {item.product?.name}
                      </h4>
                      <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-900">
                    ${(Number(item.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping & Payment summary */}
          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2 text-xs">
              <h4 className="font-bold uppercase tracking-wider text-slate-400">Shipping Address</h4>
              <p className="font-semibold text-slate-800">{order.shippingInfo?.fullName || "Valued Customer"}</p>
              <p className="text-slate-600">{order.shippingInfo?.address || "123 Norodom Blvd"}, {order.shippingInfo?.city || "Phnom Penh"}</p>
              <p className="text-slate-500">Phone: {order.shippingInfo?.phone || "+855 12 345 678"}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
              <h4 className="font-bold uppercase tracking-wider text-slate-400">Payment Breakdown</h4>
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold">${Number(order.totalAmount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span className="font-semibold text-emerald-600">Free</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                <span>Total</span>
                <span>${Number(order.totalAmount).toFixed(2)}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
