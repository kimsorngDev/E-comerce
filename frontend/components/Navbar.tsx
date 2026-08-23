"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = localStorage.getItem("isLoggedIn");
      setIsLoggedIn(loggedIn === "true");
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
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

  return (
    <nav className="border-b px-8 py-4">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-blue-500">
          MyShop
        </Link>

        {/* Desktop Menu */}
        <div className="hidden items-center gap-6 md:flex">
          <Link href="/" className="hover:text-blue-500">
            Home
          </Link>

          <Link href="/products" className="hover:text-blue-500">
            Products
          </Link>

          <Link href="/about" className="hover:text-blue-500">
            About
          </Link>

          <Link href="/contact" className="hover:text-blue-500">
            Contact
          </Link>

          <Link href="/cart" className="text-xl hover:text-blue-500">
            <i className="bi bi-cart-fill"></i>
          </Link>

          {isLoggedIn ? (
            <>
              <Link href="/admin" className="hover:text-blue-500">
                Admin
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="hover:text-red-500"
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="hover:text-blue-500">
              Login
            </Link>
          )}
        </div>

        {/* Mobile Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-2xl md:hidden"
          aria-label="Open menu"
        >
          <i className="bi bi-list"></i>
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="mt-4 flex flex-col gap-4 md:hidden">
          <Link href="/" onClick={handleOpen}>
            Home
          </Link>

          <Link href="/products" onClick={handleOpen}>
            Products
          </Link>

          <Link href="/about" onClick={handleOpen}>
            About
          </Link>

          <Link href="/contact" onClick={handleOpen}>
            Contact
          </Link>

          <Link href="/cart" onClick={handleOpen}>
            <i className="bi bi-cart-fill mr-2"></i>
            Cart
          </Link>

          {isLoggedIn ? (
            <>
              <Link href="/admin" onClick={handleOpen}>
                Admin
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="text-left hover:text-red-500"
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" onClick={handleOpen}>
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}