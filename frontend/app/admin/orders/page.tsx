"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { orderApi, Order } from "@/lib/api";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderApi.getAllOrders();
      setOrders(data);
    } catch (err: any) {
      console.error("Failed to load admin orders:", err);
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      setUpdatingId(orderId);
      await orderApi.updateOrderStatus(orderId, newStatus);
      await loadOrders();
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "DELIVERED":
        return "bg-emerald-100 text-emerald-800";
      case "SHIPPED":
        return "bg-blue-100 text-blue-800";
      case "PROCESSING":
        return "bg-amber-100 text-amber-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-purple-100 text-purple-800";
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Order Management</h1>
          <p className="text-sm text-slate-500 mt-1">Review customer orders and update delivery fulfillment status.</p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading order queue...</div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No orders found in database.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3.5">Order ID</th>
                    <th className="px-4 py-3.5">Customer</th>
                    <th className="px-4 py-3.5">Items</th>
                    <th className="px-4 py-3.5">Total Amount</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-medium text-slate-900">#{order.id}</td>

                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900">
                          {(order as any).user?.name || (order as any).user?.email || `User #${order.userId}`}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(order.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {order.items?.length || 0} line items
                      </td>

                      <td className="px-4 py-3 font-bold text-slate-900">
                        ${Number(order.totalAmount).toFixed(2)}
                      </td>

                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <select
                          disabled={updatingId === order.id}
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold outline-none focus:border-blue-500 disabled:opacity-50"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="PROCESSING">PROCESSING</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
