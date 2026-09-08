"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../hooks/useAuth";
import { authApi } from "../../lib/api";

type UserProfile = {
  id: number;
  name?: string;
  email: string;
  createdAt: string;
};

export default function AccountPage() {
  const router = useRouter();
  const { isLoggedIn, loading: authLoading } = useAuth(true);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn) return;

    async function fetchProfile() {
      try {
        setLoading(true);
        setError(null);
        const data = await authApi.getMe();
        setProfile(data);
      } catch (err: any) {
        console.error("Failed to load user profile:", err);
        setError(err.message || "Failed to load account information");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("storage"));
    router.push("/login");
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-gray-500 font-medium">Loading your account details...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null; // Handled by useAuth guard
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="border-b border-gray-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Account</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your profile, view activity, and security settings.</p>
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-2xs hover:bg-red-700 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-md bg-red-50 p-4 border border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* User Information Card */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="sm:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3">User Profile</h2>
          
          <dl className="mt-4 space-y-4 text-sm">
            <div>
              <dt className="text-xs uppercase font-semibold text-gray-500">Full Name</dt>
              <dd className="mt-1 font-medium text-gray-900">{profile?.name || "N/A"}</dd>
            </div>

            <div>
              <dt className="text-xs uppercase font-semibold text-gray-500">Email Address</dt>
              <dd className="mt-1 font-medium text-gray-900">{profile?.email}</dd>
            </div>

            <div>
              <dt className="text-xs uppercase font-semibold text-gray-500">Member Since</dt>
              <dd className="mt-1 font-medium text-gray-900">
                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "N/A"}
              </dd>
            </div>
          </dl>
        </div>

        {/* Quick Links Card */}
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 shadow-2xs">
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-3">Quick Navigation</h2>
          
          <ul role="list" className="mt-4 space-y-3">
            <li>
              <Link
                href="/orders"
                className="flex items-center justify-between rounded-lg bg-white p-3 text-sm font-semibold text-gray-900 border border-gray-200 hover:border-blue-500 hover:text-blue-600 transition"
              >
                <span>My Orders</span>
                <span>&rarr;</span>
              </Link>
            </li>
            <li>
              <Link
                href="/cart"
                className="flex items-center justify-between rounded-lg bg-white p-3 text-sm font-semibold text-gray-900 border border-gray-200 hover:border-blue-500 hover:text-blue-600 transition"
              >
                <span>My Cart</span>
                <span>&rarr;</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
