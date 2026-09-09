"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="w-full bg-slate-900 text-white pt-16 pb-12 border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-900 shadow-sm">
                <svg
                  className="h-5 w-5"
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
              <span className="text-xl font-bold tracking-tight text-white">
                ShopEase
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Your one-stop shop for the best products and great deals.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider">Quick Links</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition-colors">Products</Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition-colors">Categories</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">About</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider">Customer Service</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <a href="#faq" className="hover:text-white transition-colors">FAQs</a>
              </li>
              <li>
                <a href="#shipping" className="hover:text-white transition-colors">Shipping</a>
              </li>
              <li>
                <a href="#returns" className="hover:text-white transition-colors">Returns</a>
              </li>
              <li>
                <a href="#track" className="hover:text-white transition-colors">Track Order</a>
              </li>
              <li>
                <a href="#support" className="hover:text-white transition-colors">Support</a>
              </li>
            </ul>
          </div>

          {/* Follow Us */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white tracking-wider">Follow Us</h4>
            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
                aria-label="Facebook"
              >
                <i className="bi bi-facebook text-base"></i>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
                aria-label="Instagram"
              >
                <i className="bi bi-instagram text-base"></i>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
                aria-label="YouTube"
              >
                <i className="bi bi-youtube text-base"></i>
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
                aria-label="TikTok"
              >
                <i className="bi bi-tiktok text-base"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 text-center sm:text-left text-xs text-slate-500">
          <p>&copy; 2025 ShopEase. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
