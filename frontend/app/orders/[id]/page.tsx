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
        const data = await orderApi.getOrderById(orderId);
        setOrder(data);
      } catch (err: any) {
        console.error("Error loading order detail:", err);
        setError(err.message || "Failed to load order details");
      } finally {
        setLoading(false);
      }
    }

    fetchDetails();
  }, [orderId, isLoggedIn]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-gray-500 font-medium">Loading order details...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
          <h1 className="text-xl font-bold text-red-800">Order Not Found</h1>
          <p className="mt-2 text-sm text-red-600">{error || "Unable to locate order information."}</p>
          <div className="mt-6">
            <Link
              href="/orders"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
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
        return "bg-purple-100 text-purple-800 border-purple-200";
    }
  };

  const defaultImg = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/orders" className="hover:text-blue-600 transition">
          Orders
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Order #{order.id}</span>
      </nav>

      {/* Main Container */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order #{order.id}</h1>
            <p className="mt-1 text-sm text-gray-500">
              Placed on{" "}
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold border ${getStatusBadge(order.status)}`}>
              {order.status}
            </span>
          </div>
        </div>

        {/* Products List */}
        <div className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-900 mb-4">Items Ordered</h2>
          <ul role="list" className="divide-y divide-gray-200 border-t border-b border-gray-200">
            {order.items.map((item) => (
              <li key={item.id} className="flex py-4 items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                    <Image
                      src={item.product?.imageUrl || defaultImg}
                      alt={item.product?.name || "Product"}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        (e.target as any).src = defaultImg;
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{item.product?.name}</h3>
                    <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                    <p className="text-xs text-gray-500">Unit Price: ${Number(item.price).toFixed(2)}</p>
                  </div>
                </div>

                <p className="text-sm font-bold text-gray-900">
                  ${(Number(item.price) * item.quantity).toFixed(2)}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* Shipping & Summary */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8 border-t border-gray-200 pt-6">
          {/* Shipping Information */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 mb-3">Shipping Details</h3>
            {order.shippingInfo ? (
              <div className="space-y-1 text-sm text-gray-600">
                <p className="font-semibold text-gray-900">{order.shippingInfo.fullName}</p>
                <p>{order.shippingInfo.address}</p>
                <p>
                  {order.shippingInfo.city} {order.shippingInfo.postalCode}
                </p>
                <p className="pt-1 text-xs text-gray-500">Phone: {order.shippingInfo.phone}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">Standard Shipping Address</p>
            )}
          </div>

          {/* Payment Breakdown */}
          <div className="space-y-2 text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 mb-2">Payment Summary</h3>
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${Number(order.totalAmount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span className="text-emerald-600 font-semibold">FREE</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 font-bold text-base text-gray-900">
              <span>Total Amount</span>
              <span className="text-blue-600">${Number(order.totalAmount).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Action Link */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center">
          <Link href="/orders" className="text-sm font-semibold text-blue-600 hover:text-blue-500">
            &larr; Back to Order History
          </Link>
        </div>
      </div>
    </div>
  );
}
