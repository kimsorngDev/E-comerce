"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { href: "/admin", label: "Dashboard", icon: "bi-grid" },
    { href: "/admin/products", label: "Products", icon: "bi-box-seam" },
    { href: "/admin/categories", label: "Categories", icon: "bi-tags" },
    { href: "/admin/users", label: "Users", icon: "bi-people" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("adminEmail");
    router.push("/login");
  };

  return (
    <aside className="w-64 bg-[#0f172a] text-white min-h-screen p-5 flex flex-col justify-between shrink-0">
      <div>
        {/* Brand Logo: ShopEase with Shopping Bag */}
        <Link href="/admin" className="flex items-center gap-2.5 px-2 py-3 mb-6">
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

        {/* Menu Navigation */}
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-slate-800 text-white font-semibold"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <i className={`bi ${item.icon} text-lg`}></i>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Logout and Back Link */}
      <div className="space-y-3 pt-6 border-t border-slate-800">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800/60 hover:text-white transition-colors"
        >
          <i className="bi bi-shop text-base"></i>
          <span>Back to Store</span>
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800/60 hover:text-rose-400 transition-colors"
        >
          <i className="bi bi-box-arrow-right text-base"></i>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
