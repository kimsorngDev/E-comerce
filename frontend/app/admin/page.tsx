"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/AdminLayout";
import { orderApi } from "@/lib/api";

type Stats = {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  recentOrders: Array<{
    id: number;
    customer: string;
    status: string;
    totalAmount: number;
    createdAt: string;
  }>;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        setError(null);
        const data = await orderApi.getDashboardStats();
        setStats(data);
      } catch (err: any) {
        console.error("Dashboard stats error:", err);
        setError(err.message || "Failed to load dashboard metrics");
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const getStatusStyle = (status: string) => {
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
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time statistics and recent store activity.</p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200"></div>
            ))}
          </div>
        ) : (
          <>
            {/* Stats Metric Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <p className="text-xs font-semibold uppercase text-slate-500">Total Revenue</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">${stats?.totalRevenue.toFixed(2)}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <p className="text-xs font-semibold uppercase text-slate-500">Total Orders</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{stats?.totalOrders}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <p className="text-xs font-semibold uppercase text-slate-500">Active Products</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{stats?.totalProducts}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <p className="text-xs font-semibold uppercase text-slate-500">Registered Users</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{stats?.totalUsers}</p>
              </div>
            </div>

            {/* Recent Orders Section */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <h2 className="text-lg font-bold text-slate-900">Recent Orders</h2>
                <Link href="/admin/orders" className="text-xs font-semibold text-blue-600 hover:underline">
                  View All &rarr;
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Order ID</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats?.recentOrders?.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-mono font-medium text-slate-900">#{order.id}</td>
                        <td className="px-4 py-3 font-medium text-slate-900">{order.customer}</td>
                        <td className="px-4 py-3 text-slate-500">
                          {new Date(order.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusStyle(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-900">
                          ${order.totalAmount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}