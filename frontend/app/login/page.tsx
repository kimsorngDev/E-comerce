"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setLoginError("Please enter both email and password");
      return;
    }

    setIsLoading(true);

    try {
      let authSuccess = false;
      let userName = "";
      let userRole = "USER";
      let token = "";

      // 1. Try Backend API login
      try {
        const authResult = await authApi.login(cleanEmail, password);
        if (authResult && authResult.token) {
          authSuccess = true;
          token = authResult.token;
          userName = authResult.user?.name || cleanEmail.split("@")[0];
          userRole = authResult.user?.role || "USER";
        }
      } catch (apiErr: any) {
        // API error (check local registered users)
      }

      // 2. Check locally registered users list if API didn't authenticate
      if (!authSuccess) {
        const storedUsersRaw = localStorage.getItem("registeredUsers");
        const storedUsers: any[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : [];
        const foundUser = storedUsers.find((u) => u.email.toLowerCase() === cleanEmail);

        if (foundUser) {
          if (foundUser.password === password) {
            authSuccess = true;
            userName = foundUser.name;
            userRole = foundUser.role || "USER";
            token = `jwt-local-${Date.now()}`;
          } else {
            // Explicit wrong password for existing user
            throw new Error("Invalid email or password");
          }
        } else if (cleanEmail === "admin@shopease.com" && password === "admin123") {
          // Default admin demo credentials
          authSuccess = true;
          userName = "Admin";
          userRole = "ADMIN";
          token = `jwt-admin-${Date.now()}`;
        } else if (cleanEmail === "user@shopease.com" && password === "password123") {
          // Default demo customer credentials
          authSuccess = true;
          userName = "Demo User";
          userRole = "USER";
          token = `jwt-user-${Date.now()}`;
        }
      }

      if (!authSuccess) {
        throw new Error("Invalid email or password. Please check your credentials or register a new account.");
      }

      // Set auth in storage
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userName", userName);
      localStorage.setItem("userEmail", cleanEmail);
      localStorage.setItem("token", token);

      if (userRole === "ADMIN" || cleanEmail.includes("admin")) {
        localStorage.setItem("isAdmin", "true");
        localStorage.setItem("adminEmail", cleanEmail);
      } else {
        localStorage.removeItem("isAdmin");
        localStorage.removeItem("adminEmail");
      }

      window.dispatchEvent(new Event("storage"));

      const params = new URLSearchParams(window.location.search);
      const redirectUrl = params.get("redirect") || (userRole === "ADMIN" ? "/admin" : "/");
      router.push(redirectUrl);
    } catch (error: any) {
      setLoginError(error.message || "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    const demoEmail = provider === "Google" ? "alex.google@example.com" : "alex.fb@example.com";
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userName", "Alex Rivers");
    localStorage.setItem("userEmail", demoEmail);
    localStorage.setItem("token", `jwt-social-${Date.now()}`);
    localStorage.removeItem("isAdmin");
    window.dispatchEvent(new Event("storage"));
    router.push("/");
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center bg-[#f8fafc] px-4 py-12">
      <div className="w-full max-w-md">
        
        {/* Card */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-10 shadow-xs">
          
          {/* Top Shopping Bag Icon */}
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

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Welcome Back
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Login to your account to continue
            </p>
          </div>

          {/* Error message */}
          {loginError && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 font-medium">
              <i className="bi bi-exclamation-circle-fill text-red-500 text-sm mt-0.5"></i>
              <span>{loginError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 shadow-2xs"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full h-11 pl-3.5 pr-10 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  tabIndex={-1}
                >
                  <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded text-slate-900 border-slate-300 focus:ring-0"
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => alert("Please register a new account or sign in with registered credentials.")}
                className="font-semibold text-blue-600 hover:underline cursor-pointer bg-transparent border-0 p-0 text-xs"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl bg-[#0f172a] text-sm font-bold text-white hover:bg-slate-800 transition-all shadow-sm active:scale-98 mt-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Login"}
            </button>
          </form>

          {/* "or" Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <span className="relative bg-white px-3 text-xs text-slate-400">
              or
            </span>
          </div>

          {/* Social Logins */}
          <div className="space-y-2.5">
            {/* Google */}
            <button
              onClick={() => handleSocialLogin("Google")}
              type="button"
              className="w-full flex h-11 items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-all cursor-pointer"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Continue with Google
            </button>

            {/* Facebook */}
            <button
              onClick={() => handleSocialLogin("Facebook")}
              type="button"
              className="w-full flex h-11 items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-all cursor-pointer"
            >
              <i className="bi bi-facebook text-[#1877F2] text-base"></i>
              Continue with Facebook
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-xs text-slate-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-blue-600 hover:underline">
              Sign up
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}