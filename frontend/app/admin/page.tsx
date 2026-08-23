"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn");
    if (loggedIn !== "true") {
      router.push("/login");
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  if (!isAuthorized) {
    return (
      <main className="p-8">
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <p className="mt-2 text-gray-600">Welcome to the Admin Panel.</p>

      <div className="mt-4 flex flex-col gap-2">
        <a href="/admin/products" className="text-blue-500 hover:underline">
          Products
        </a>
        <a href="/admin/categories" className="text-blue-500 hover:underline">
          Categories
        </a>
        <a href="/admin/users" className="text-blue-500 hover:underline">
          Users
        </a>
      </div>
    </main>
  );
}