"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useCart } from "../hooks/useCart";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { itemCount: cartCount } = useCart();

  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = localStorage.getItem("isLoggedIn");
      setIsLoggedIn(loggedIn === "true");
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  const handleOpen = () => {
    setIsOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setIsOpen(false);
    window.dispatchEvent(new Event("storage"));
    router.push("/login");
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  const userLinks = [
    { href: "/orders", label: "My Orders", icon: "bi-bag-check" },
    { href: "/account", label: "Account", icon: "bi-person-circle" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur-md shadow-xs transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-black tracking-tight text-gray-900 transition hover:opacity-90"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-md shadow-blue-500/20">
            <span className="text-lg font-extrabold">M</span>
          </div>
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            MyShop
          </span>
        </Link>

        {/* Desktop Main Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions Header */}
        <div className="hidden md:flex items-center gap-3">
          {/* Shopping Cart Button */}
          <Link
            href="/cart"
            className="relative flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-2xs transition hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-600"
            aria-label="Shopping cart"
          >
            <svg className="h-5 w-5 text-gray-600 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="font-semibold">Cart</span>
            {cartCount > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-600 px-1.5 text-xs font-bold text-white shadow-xs">
                {cartCount}
              </span>
            )}
          </Link>

          <div className="h-5 w-[1px] bg-gray-200" />

          {/* Authentication State Navigation */}
          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <Link
                href="/orders"
                className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                  pathname === "/orders"
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                Orders
              </Link>

              <Link
                href="/account"
                className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                  pathname === "/account"
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                Account
              </Link>

              <Link
                href="/admin"
                className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 transition"
              >
                Admin Panel
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl bg-gray-100 px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-xl px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition"
              >
                Sign In
              </Link>

              <Link
                href="/register"
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/cart"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            aria-label="Toggle menu"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="border-t border-gray-100 bg-white px-4 pt-3 pb-6 md:hidden shadow-lg animate-in slide-in-from-top-2">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={handleOpen}
                className="block rounded-lg px-3 py-2.5 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="mt-4 border-t border-gray-100 pt-4">
            {isLoggedIn ? (
              <div className="space-y-1">
                {userLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={handleOpen}
                    className="block rounded-lg px-3 py-2.5 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/admin"
                  onClick={handleOpen}
                  className="block rounded-lg px-3 py-2.5 text-base font-medium text-gray-700 hover:bg-gray-100"
                >
                  Admin Panel
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left rounded-lg px-3 py-2.5 text-base font-semibold text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  href="/login"
                  onClick={handleOpen}
                  className="flex items-center justify-center rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={handleOpen}
                  className="flex items-center justify-center rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 shadow-xs"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}