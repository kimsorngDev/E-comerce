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

  useEffect(() => {
    if (!orderId) return;

    async function fetchOrderDetails() {
      try {
        setLoading(true);

        // 1. Try backend API first (source of truth)
        try {
          const data = await orderApi.getOrderById(orderId);
          if (data) {
            setOrder(data);
            return;
          }
        } catch {
          // Backend offline or error -> try local fallback
        }

        // 2. Try local storage per-user orders
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

        // 3. Demo fallback if order is completely unknown
        setOrder({
          id: Number(orderId) || 1001,
          userId: 1,
          status: "PENDING",
          totalAmount: 0.0,
          createdAt: new Date().toISOString(),
          items: [],
          shippingInfo: {
            fullName: (typeof window !== "undefined" && localStorage.getItem("userName")) || "Valued Customer",
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

    fetchOrderDetails();
  }, [orderId]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-900 border-t-transparent"></div>
        <p className="text-slate-500 font-medium text-sm">Confirming your order...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Success Header Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 text-center shadow-2xs space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-xs">
            <i className="bi bi-check2-circle text-4xl"></i>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Thank you for your order!
          </h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Your order <span className="font-bold text-slate-800">#{order?.id || orderId}</span> has been confirmed. We&apos;ll notify you when it ships.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={`/orders/${order?.id || orderId}`}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-xs sm:text-sm font-bold text-white hover:bg-slate-800 transition-all shadow-sm"
            >
              <i className="bi bi-box-seam"></i>
              View Order Details
            </Link>
            <Link
              href="/orders"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs"
            >
              <i className="bi bi-list-task"></i>
              My Orders
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs"
            >
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Details Breakdown */}
        {order && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Order Summary</h3>
                <p className="text-xs text-slate-400">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 uppercase">
                {order.status}
              </span>
            </div>

            {/* Items */}
            <div className="space-y-4">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4">
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

            {/* Shipping details */}
            {order.shippingInfo && (
              <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Deliver To</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{order.shippingInfo.fullName}</p>
                  <p className="text-slate-600">{order.shippingInfo.address}, {order.shippingInfo.city}</p>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Contact Phone</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{order.shippingInfo.phone}</p>
                </div>
              </div>
            )}

            {/* Total */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-base font-bold text-slate-900">
              <span>Total Paid</span>
              <span className="text-xl">${Number(order.totalAmount).toFixed(2)}</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
