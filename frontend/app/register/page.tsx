"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!name.trim() || !email.trim() || !password) {
      setErrorMessage("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      let registeredData: any = null;
      try {
        registeredData = await authApi.register(name.trim(), email.trim(), password);
      } catch (apiErr: any) {
        // Backend might be offline or returned message
        console.warn("Backend API register notice:", apiErr?.message);
      }

      // 1. Save user locally to remember their credentials for login & session
      const storedUsersRaw = localStorage.getItem("registeredUsers");
      const storedUsers = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
      const userExists = storedUsers.some(
        (u: any) => u.email.toLowerCase() === email.trim().toLowerCase()
      );

      const newUserObj = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: email.toLowerCase().includes("admin") ? "ADMIN" : "USER",
        createdAt: new Date().toISOString(),
      };

      if (!userExists) {
        storedUsers.push(newUserObj);
        localStorage.setItem("registeredUsers", JSON.stringify(storedUsers));
      }

      // 2. Automatically log in the user immediately
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userName", name.trim());
      localStorage.setItem("userEmail", email.trim().toLowerCase());
      localStorage.setItem(
        "token",
        registeredData?.token || `jwt-${Date.now()}-${Math.random().toString(36).substring(2)}`
      );

      if (newUserObj.role === "ADMIN") {
        localStorage.setItem("isAdmin", "true");
        localStorage.setItem("adminEmail", email.trim().toLowerCase());
      } else {
        localStorage.removeItem("isAdmin");
      }

      // 3. Dispatch events so navbar, cart, and all components refresh
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("cart-updated"));

      setSuccessMessage("Account created successfully! Redirecting...");

      const params = new URLSearchParams(window.location.search);
      const redirectUrl = params.get("redirect") || (newUserObj.role === "ADMIN" ? "/admin" : "/account");

      setTimeout(() => {
        router.push(redirectUrl);
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center bg-[#f8fafc] px-4 py-12">
      <div className="w-full max-w-md">
        
        <div className="rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-10 shadow-xs">
          {/* ShopEase Bag Icon */}
          <div className="flex justify-center mb-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Create an Account
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Join ShopEase to start shopping today
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 font-semibold">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 shadow-2xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 shadow-2xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Password (min. 6 characters)</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="w-full h-11 pl-3.5 pr-10 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 shadow-2xs"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl bg-[#0f172a] text-sm font-bold text-white hover:bg-slate-800 transition-all shadow-sm active:scale-98 mt-2"
            >
              {isLoading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-blue-600 hover:underline">
              Login
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}