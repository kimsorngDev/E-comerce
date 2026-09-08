"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { href: "/admin", label: "Dashboard", icon: "bi-speedometer2" },
    { href: "/admin/products", label: "Products", icon: "bi-box-seam" },
    { href: "/admin/orders", label: "Orders", icon: "bi-cart-check" },
    { href: "/admin/categories", label: "Categories", icon: "bi-tags" },
    { href: "/admin/users", label: "Users", icon: "bi-people" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("adminEmail");
    router.push("/admin/login");
  };

  return (
    <aside className="w-full md:w-64 bg-slate-900 text-white min-h-screen p-4 flex flex-col justify-between shrink-0 shadow-xl">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-3 py-4 border-b border-slate-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-lg">
            A
          </div>
          <div>
            <h2 className="font-bold text-base tracking-wide text-slate-100">Admin Console</h2>
            <p className="text-xs text-slate-400">Management Panel</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="mt-6 space-y-1.5">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <i className={`bi ${item.icon} text-lg`}></i>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="px-3 py-4 border-t border-slate-800 space-y-3">
        <Link href="/" className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 transition-colors">
          <i className="bi bi-shop"></i>
          Back to Store
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full text-xs text-red-400 hover:text-red-300 transition-colors"
        >
          <i className="bi bi-box-arrow-right"></i>
          Logout
        </button>
        <p className="text-xs text-slate-600">E-Commerce Admin v1.0</p>
      </div>
    </aside>
  );
}
