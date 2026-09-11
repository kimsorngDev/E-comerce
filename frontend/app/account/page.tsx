"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../hooks/useAuth";
import { authApi, orderApi, Order } from "../../lib/api";

type UserProfile = {
  id?: number;
  name?: string;
  email: string;
  createdAt?: string;
};

export default function AccountPage() {
  const router = useRouter();
  const { isLoggedIn, loading: authLoading } = useAuth(true);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isLoggedIn) return;

    async function loadAccountData() {
      try {
        setLoading(true);

        // 1. Get profile from API or LocalStorage
        const localName = localStorage.getItem("userName") || "User";
        const localEmail = localStorage.getItem("userEmail") || "user@example.com";

        try {
          const apiData = await authApi.getMe();
          if (apiData && apiData.email) {
            setProfile(apiData);
          } else {
            setProfile({
              name: localName,
              email: localEmail,
              createdAt: new Date().toISOString(),
            });
          }
        } catch {
          setProfile({
            name: localName,
            email: localEmail,
            createdAt: new Date().toISOString(),
          });
        }

        // 2. Load user orders from backend API (primary source of truth)
        try {
          const ordersData = await orderApi.getUserOrders();
          if (Array.isArray(ordersData)) {
            setOrders(ordersData);
            return;
          }
        } catch {
          // Backend offline -> fall back to localStorage
        }

        // Fallback: load from per-user localStorage
        let localUserOrders: Order[] = [];
        if (typeof window !== "undefined") {
          const localEmail = (localStorage.getItem("userEmail") || "default").toLowerCase();
          const storedOrdersRaw = localStorage.getItem(`orders_${localEmail}`);
          if (storedOrdersRaw) {
            try {
              localUserOrders = JSON.parse(storedOrdersRaw);
            } catch {
              localUserOrders = [];
            }
          }
        }
        setOrders(localUserOrders);
      } finally {
        setLoading(false);
      }
    }

    loadAccountData();
  }, [isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("adminEmail");
    window.dispatchEvent(new Event("cart-updated"));
    window.dispatchEvent(new Event("storage"));
    router.push("/login");
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-900 border-t-transparent"></div>
        <p className="text-slate-500 font-medium text-sm">Loading your account details...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  const displayName = profile?.name || "ShopEase Member";
  const displayEmail = profile?.email || "user@example.com";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#f8fafc] py-10 sm:py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Profile Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-18 w-18 items-center justify-center rounded-2xl bg-slate-900 text-white text-2xl font-black shadow-sm">
              {initial}
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                {displayName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {displayEmail}
              </p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                Active Member
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/orders"
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              My Orders
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl bg-slate-900 text-xs sm:text-sm font-semibold text-white hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Account Details & Order Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Account Details */}
          <div className="md:col-span-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-slate-900">Personal Info</h2>
            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <span className="text-slate-400 block">Full Name</span>
                <span className="font-semibold text-slate-800">{displayName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Email</span>
                <span className="font-semibold text-slate-800">{displayEmail}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Member Since</span>
                <span className="font-semibold text-slate-800">
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "2025"}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Orders Overview */}
          <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Recent Purchases</h2>
              {orders.length > 0 && (
                <Link href="/orders" className="text-xs font-semibold text-blue-600 hover:underline">
                  View All &rarr;
                </Link>
              )}
            </div>

            {orders.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  You haven&apos;t placed any orders yet.
                </p>
                <Link
                  href="/products"
                  className="inline-block text-xs font-bold text-slate-900 hover:underline"
                >
                  Start Shopping &rarr;
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 3).map((ord) => (
                  <div
                    key={ord.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-900">Order #{ord.id}</span>
                      <p className="text-[11px] text-slate-400">
                        {new Date(ord.createdAt).toLocaleDateString()} &bull; {ord.items?.length || 1} items
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-900">
                        ${Number(ord.totalAmount).toFixed(2)}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                        {ord.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
