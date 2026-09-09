"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { fetchApi } from "@/lib/api";

type Category = {
  id: number;
  name: string;
  createdAt?: string;
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creating, setCreating] = useState(false);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchApi("/categories");
      setCategories(data.categories || data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      setCreating(true);
      await fetchApi("/categories", {
        method: "POST",
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });
      setNewCategoryName("");
      await loadCategories();
    } catch (err: any) {
      alert(err.message || "Failed to create category");
    } finally {
      setCreating(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Categories</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Manage catalog categories and product classifications.</p>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs sm:text-sm text-rose-700">
            {error}
          </div>
        )}

        {/* Create Category Form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 mb-3">Add New Category</h2>
          <form onSubmit={handleCreateCategory} className="flex flex-col sm:flex-row gap-3 max-w-xl">
            <input
              type="text"
              required
              placeholder="e.g. Smart Watches, Audio"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={creating}
              className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 transition disabled:opacity-50"
            >
              {creating ? "Adding..." : "+ Create Category"}
            </button>
          </form>
        </div>

        {/* Categories Table */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">All Categories ({categories.length})</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-400 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">ID</th>
                  <th className="px-6 py-3.5">Category Name</th>
                  <th className="px-6 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-slate-400 font-medium">
                      Loading categories...
                    </td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-slate-400 font-medium">
                      No categories found.
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">#{cat.id}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">{cat.name}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}