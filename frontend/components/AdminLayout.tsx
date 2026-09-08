"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";

export function useAdminAuth() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Frontend-only admin check: look for the isAdmin flag set by /admin/login
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    if (!isAdmin) {
      router.push("/admin/login");
    } else {
      setIsAuthorized(true);
    }
    setLoading(false);
  }, [router]);

  return { isAuthorized, loading };
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthorized, loading } = useAdminAuth();

  if (loading || !isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-400">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-h-screen">
        {children}
      </main>
    </div>
  );
}
