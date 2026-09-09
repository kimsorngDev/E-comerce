"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import AdminLayout from "@/components/AdminLayout";
import { orderApi } from "@/lib/api";
import { PRODUCTS } from "../data/products";

export default function AdminDashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("This 6 months");

  const topProducts = [
    { name: "iPhone 15", sold: 52, revenue: 41548, image: PRODUCTS[0]?.imageUrl },
    { name: "MacBook Air", sold: 38, revenue: 37962, image: PRODUCTS[1]?.imageUrl },
    { name: "AirPods Pro", sold: 32, revenue: 7968, image: PRODUCTS[3]?.imageUrl },
    { name: "Running Shoes", sold: 28, revenue: 1652, image: PRODUCTS[5]?.imageUrl },
    { name: "Backpack", sold: 24, revenue: 1080, image: PRODUCTS[7]?.imageUrl },
  ];

  const recentOrders = [
    { id: "#1001", customer: "John Doe", total: "$799.00", status: "Delivered", date: "Aug 28, 2025" },
    { id: "#1002", customer: "Sara Kim", total: "$159.00", status: "Processing", date: "Aug 27, 2025" },
    { id: "#1003", customer: "David Lee", total: "$249.00", status: "Shipped", date: "Aug 26, 2025" },
    { id: "#1004", customer: "Emily Chen", total: "$99.00", status: "Delivered", date: "Aug 25, 2025" },
    { id: "#1005", customer: "Michael Tan", total: "$59.00", status: "Processing", date: "Aug 24, 2025" },
  ];

  const recentUsers = [
    { name: "Kimsorng", email: "kimsorng@email.com", role: "Admin" },
    { name: "Sokha", email: "sokha@email.com", role: "User" },
    { name: "Phea", email: "phea@email.com", role: "User" },
    { name: "Dara", email: "dara@email.com", role: "User" },
    { name: "Srey", email: "srey@email.com", role: "User" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        
        {/* ─── TOP BAR ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Welcome back, Admin!
            </p>
          </div>

          {/* Admin Profile Pill */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white shadow-2xs">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                A
              </div>
              <span className="text-xs font-semibold text-slate-800">Admin</span>
              <i className="bi bi-chevron-down text-xs text-slate-400"></i>
            </div>
          </div>
        </div>

        {/* ─── 4 STAT KPI METRIC CARDS ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* 1. Total Products */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Total Products</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <i className="bi bi-box-seam text-base"></i>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">48</div>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1">
                <i className="bi bi-arrow-up-short text-base"></i>
                +12% from last month
              </span>
            </div>
          </div>

          {/* 2. Total Orders */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Total Orders</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <i className="bi bi-cart3 text-base"></i>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">124</div>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1">
                <i className="bi bi-arrow-up-short text-base"></i>
                +8% from last month
              </span>
            </div>
          </div>

          {/* 3. Total Users */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Total Users</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <i className="bi bi-people text-base"></i>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">56</div>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1">
                <i className="bi bi-arrow-up-short text-base"></i>
                +5% from last month
              </span>
            </div>
          </div>

          {/* 4. Total Revenue */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Total Revenue</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <i className="bi bi-graph-up-arrow text-base"></i>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">$8,420</div>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1">
                <i className="bi bi-arrow-up-short text-base"></i>
                +15% from last month
              </span>
            </div>
          </div>

        </div>

        {/* ─── ROW 1: SALES OVERVIEW + TOP PRODUCTS ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Sales Overview Line Chart */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Sales Overview</h3>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer"
              >
                <option>This 6 months</option>
                <option>This year</option>
                <option>Last 30 days</option>
              </select>
            </div>

            {/* Interactive SVG Smooth Line Chart */}
            <div className="relative w-full h-64 pt-2">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200">
                <defs>
                  <linearGradient id="salesGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="40" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="60" x2="480" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="100" x2="480" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="140" x2="480" y2="140" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="180" x2="480" y2="180" stroke="#e2e8f0" strokeWidth="1" />

                {/* Y-axis Labels */}
                <text x="30" y="24" fontSize="10" fill="#94a3b8" textAnchor="end">100k</text>
                <text x="30" y="64" fontSize="10" fill="#94a3b8" textAnchor="end">800</text>
                <text x="30" y="104" fontSize="10" fill="#94a3b8" textAnchor="end">600</text>
                <text x="30" y="144" fontSize="10" fill="#94a3b8" textAnchor="end">400</text>
                <text x="30" y="184" fontSize="10" fill="#94a3b8" textAnchor="end">0</text>

                {/* Area Gradient */}
                <path
                  d="M 50 160 C 110 130, 160 150, 210 90 C 260 50, 310 80, 360 40 C 410 20, 440 60, 470 50 L 470 180 L 50 180 Z"
                  fill="url(#salesGradient)"
                />

                {/* Spline Line */}
                <path
                  d="M 50 160 C 110 130, 160 150, 210 90 C 260 50, 310 80, 360 40 C 410 20, 440 60, 470 50"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Data Points */}
                {[
                  { x: 50, y: 160 },
                  { x: 120, y: 140 },
                  { x: 190, y: 120 },
                  { x: 260, y: 65 },
                  { x: 330, y: 75 },
                  { x: 400, y: 35 },
                  { x: 470, y: 50 },
                ].map((pt, i) => (
                  <circle
                    key={i}
                    cx={pt.x}
                    cy={pt.y}
                    r="4.5"
                    className="fill-white stroke-blue-600 stroke-[2.5] hover:r-6 transition-all cursor-pointer"
                  />
                ))}

                {/* X-axis Labels */}
                <text x="50" y="196" fontSize="10" fill="#94a3b8" textAnchor="middle">Jan</text>
                <text x="120" y="196" fontSize="10" fill="#94a3b8" textAnchor="middle">Feb</text>
                <text x="190" y="196" fontSize="10" fill="#94a3b8" textAnchor="middle">Mar</text>
                <text x="260" y="196" fontSize="10" fill="#94a3b8" textAnchor="middle">Apr</text>
                <text x="330" y="196" fontSize="10" fill="#94a3b8" textAnchor="middle">May</text>
                <text x="400" y="196" fontSize="10" fill="#94a3b8" textAnchor="middle">Jun</text>
                <text x="470" y="196" fontSize="10" fill="#94a3b8" textAnchor="middle">Jul</text>
              </svg>
            </div>
          </div>

          {/* Top Products Table */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
            <h3 className="text-base font-bold text-slate-900 mb-4">Top Products</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                    <th className="pb-3 font-semibold">Product</th>
                    <th className="pb-3 font-semibold text-center">Sold</th>
                    <th className="pb-3 font-semibold text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topProducts.map((p) => (
                    <tr key={p.name} className="hover:bg-slate-50/50">
                      <td className="py-3 flex items-center gap-3">
                        <div className="relative h-8 w-8 shrink-0 rounded-lg overflow-hidden bg-slate-50 border border-slate-100">
                          {p.image && <Image src={p.image} alt={p.name} fill className="object-contain p-0.5" />}
                        </div>
                        <span className="font-semibold text-slate-800 line-clamp-1">{p.name}</span>
                      </td>
                      <td className="py-3 text-center text-slate-600 font-medium">{p.sold}</td>
                      <td className="py-3 text-right font-bold text-slate-900">
                        ${p.revenue.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* ─── ROW 2: RECENT ORDERS + RECENT USERS ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Recent Orders */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
            <h3 className="text-base font-bold text-slate-900 mb-4">Recent Orders</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                    <th className="pb-3 font-semibold">Order ID</th>
                    <th className="pb-3 font-semibold">Customer</th>
                    <th className="pb-3 font-semibold">Total</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/50">
                      <td className="py-3 font-bold text-slate-900">{ord.id}</td>
                      <td className="py-3 text-slate-700 font-medium">{ord.customer}</td>
                      <td className="py-3 font-semibold text-slate-900">{ord.total}</td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            ord.status === "Delivered"
                              ? "bg-emerald-50 text-emerald-700"
                              : ord.status === "Shipped"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3 text-right text-slate-400">{ord.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Users */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
            <h3 className="text-base font-bold text-slate-900 mb-4">Recent Users</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                    <th className="pb-3 font-semibold">Name</th>
                    <th className="pb-3 font-semibold">Email</th>
                    <th className="pb-3 font-semibold text-right">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentUsers.map((u) => (
                    <tr key={u.email} className="hover:bg-slate-50/50">
                      <td className="py-3 font-semibold text-slate-800">{u.name}</td>
                      <td className="py-3 text-slate-500">{u.email}</td>
                      <td className="py-3 text-right">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            u.role === "Admin"
                              ? "bg-slate-900 text-white"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </AdminLayout>
  );
}