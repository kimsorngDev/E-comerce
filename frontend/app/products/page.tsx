"use client";

import { useEffect, useState, useCallback } from "react";
import ProductCard from "../../components/ProductCard";

type Category = {
  id: number;
  name: string;
};

type Product = {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  image?: string;
  categoryId?: number;
  category?: Category;
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter states
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/categories"
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (data.categories && Array.isArray(data.categories)) {
          setCategories(data.categories);
        } else if (Array.isArray(data)) {
          setCategories(data);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const queryParams = new URLSearchParams();

      if (search.trim()) {
        queryParams.append("search", search.trim());
      }

      if (selectedCategory) {
        queryParams.append("categoryId", selectedCategory);
      }

      if (minPrice) {
        queryParams.append("minPrice", minPrice);
      }

      if (maxPrice) {
        queryParams.append("maxPrice", maxPrice);
      }

      const url = `http://localhost:5000/api/products${
        queryParams.toString()
          ? `?${queryParams.toString()}`
          : ""
      }`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch products from backend");
      }

      const data = await response.json();

      console.log("Products response:", data);

      if (data.products && Array.isArray(data.products)) {
        setProducts(data.products);
      } else if (Array.isArray(data)) {
        setProducts(data);
      } else if (data.data && Array.isArray(data.data)) {
        setProducts(data.data);
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (error: unknown) {
      console.error("Products error:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Unable to load products.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedCategory, minPrice, maxPrice]);

  // Run fetch whenever filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchProducts]);

  // Reset filters
  const handleResetFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="mx-auto max-w-7xl">

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Products
          </h1>

          <p className="mt-2 text-gray-600">
            Browse our products.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 rounded-xl border bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-4">

            {/* Search */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Search
              </label>

              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Category
              </label>

              <select
                value={selectedCategory}
                onChange={(e) =>
                  setSelectedCategory(e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 outline-none focus:border-blue-500"
              >
                <option value="">All Categories</option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Minimum Price */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Min Price
              </label>

              <input
                type="number"
                min="0"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500"
              />
            </div>

            {/* Maximum Price */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Max Price
              </label>

              <input
                type="number"
                min="0"
                placeholder="1000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Reset Button */}
          {(search ||
            selectedCategory ||
            minPrice ||
            maxPrice) && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleResetFilters}
                className="rounded-lg bg-gray-200 px-4 py-2 text-sm hover:bg-gray-300"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-xl border bg-white p-4"
              >
                <div className="h-48 rounded-lg bg-gray-200" />

                <div className="mt-4 h-5 w-3/4 rounded bg-gray-200" />

                <div className="mt-2 h-4 w-1/3 rounded bg-gray-200" />

                <div className="mt-4 h-10 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <h2 className="text-lg font-semibold text-red-700">
              Failed to load products
            </h2>

            <p className="mt-2 text-red-600">
              {error}
            </p>

            <button
              onClick={fetchProducts}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading &&
          !error &&
          products.length === 0 && (
            <div className="rounded-xl border border-dashed bg-white p-12 text-center">
              <h2 className="text-xl font-semibold">
                No products found
              </h2>

              <p className="mt-2 text-gray-500">
                Try changing your search or filters.
              </p>
            </div>
          )}

        {/* Product List */}
        {!isLoading &&
          !error &&
          products.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  stock={product.stock}
                  category={product.category}
                  image={
                    product.image ||
                    product.imageUrl ||
                    ""
                  }
                />
              ))}
            </div>
          )}
      </div>
    </main>
  );
}