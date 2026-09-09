"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "../../components/ProductCard";
import { PRODUCTS, CATEGORIES, BRANDS, Product } from "../data/products";

function ProductsContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const searchParam = searchParams.get("search");

  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || "all");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("popular");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  // Price range definitions
  const priceRanges = [
    { label: "Under $25", min: 0, max: 25 },
    { label: "$25 - $50", min: 25, max: 50 },
    { label: "$50 - $100", min: 50, max: 100 },
    { label: "$100 - $200", min: 100, max: 200 },
    { label: "Over $200", min: 200, max: Infinity },
  ];

  const handleBrandToggle = (brand: string) => {
    if (brand === "all") {
      setSelectedBrands([]);
      return;
    }
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const handlePriceRangeToggle = (label: string) => {
    setSelectedPriceRanges((prev) =>
      prev.includes(label) ? prev.filter((r) => r !== label) : [...prev, label]
    );
  };

  // Filter and Sort logic
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      // Category filter
      if (selectedCategory && selectedCategory !== "all") {
        if (product.category.slug !== selectedCategory && product.category.name.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
      }

      // Search query filter
      if (searchParam) {
        const query = searchParam.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesBrand = product.brand.toLowerCase().includes(query);
        const matchesCat = product.category.name.toLowerCase().includes(query);
        if (!matchesName && !matchesBrand && !matchesCat) {
          return false;
        }
      }

      // Brand filter
      if (selectedBrands.length > 0) {
        if (!selectedBrands.includes(product.brand)) {
          return false;
        }
      }

      // Price range filter
      if (selectedPriceRanges.length > 0) {
        const matchesPrice = selectedPriceRanges.some((rangeLabel) => {
          const range = priceRanges.find((r) => r.label === rangeLabel);
          if (!range) return true;
          return product.price >= range.min && product.price <= range.max;
        });
        if (!matchesPrice) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "popular") return (b.reviewsCount || 0) - (a.reviewsCount || 0);
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return 0;
    });
  }, [selectedCategory, searchParam, selectedBrands, selectedPriceRanges, sortBy]);

  const itemsPerPage = 9;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Products
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Showing 1-{Math.min(itemsPerPage, filteredProducts.length)} of {PRODUCTS.length * 3 + 6} products
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Filter Toggle Button */}
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-800"
            >
              <i className="bi bi-funnel"></i>
              Filters
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 hidden sm:inline">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-10 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200/90 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:border-slate-400 shadow-2xs cursor-pointer"
              >
                <option value="popular">Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Content Grid with Filter Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 items-start">
          
          {/* ─── LEFT FILTER SIDEBAR ─── */}
          <aside className={`lg:col-span-3 space-y-8 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs ${mobileFilterOpen ? "block" : "hidden lg:block"}`}>
            
            {/* 1. Categories Filter */}
            <div className="space-y-3.5">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Categories</h3>
              <div className="space-y-2.5">
                <label className="flex items-center gap-3 cursor-pointer text-sm text-slate-700 hover:text-slate-950">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === "all"}
                    onChange={() => setSelectedCategory("all")}
                    className="h-4 w-4 text-slate-900 border-slate-300 focus:ring-0"
                  />
                  <span>All Categories</span>
                </label>
                {CATEGORIES.map((cat) => (
                  <label key={cat.id} className="flex items-center gap-3 cursor-pointer text-sm text-slate-700 hover:text-slate-950">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === cat.slug}
                      onChange={() => setSelectedCategory(cat.slug)}
                      className="h-4 w-4 text-slate-900 border-slate-300 focus:ring-0"
                    />
                    <span>{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 2. Price Range Filter */}
            <div className="space-y-3.5 pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Price Range</h3>
              <div className="space-y-2.5">
                {priceRanges.map((range) => (
                  <label key={range.label} className="flex items-center gap-3 cursor-pointer text-sm text-slate-700 hover:text-slate-950">
                    <input
                      type="checkbox"
                      checked={selectedPriceRanges.includes(range.label)}
                      onChange={() => handlePriceRangeToggle(range.label)}
                      className="h-4 w-4 rounded text-slate-900 border-slate-300 focus:ring-0"
                    />
                    <span>{range.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 3. Brand Filter */}
            <div className="space-y-3.5 pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Brand</h3>
              <div className="space-y-2.5">
                <label className="flex items-center gap-3 cursor-pointer text-sm text-slate-700 hover:text-slate-950">
                  <input
                    type="checkbox"
                    checked={selectedBrands.length === 0}
                    onChange={() => handleBrandToggle("all")}
                    className="h-4 w-4 rounded text-slate-900 border-slate-300 focus:ring-0"
                  />
                  <span>All Brands</span>
                </label>
                {BRANDS.map((brand) => (
                  <label key={brand} className="flex items-center gap-3 cursor-pointer text-sm text-slate-700 hover:text-slate-950">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => handleBrandToggle(brand)}
                      className="h-4 w-4 rounded text-slate-900 border-slate-300 focus:ring-0"
                    />
                    <span>{brand}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Reset Filter Button */}
            {(selectedCategory !== "all" || selectedBrands.length > 0 || selectedPriceRanges.length > 0) && (
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedBrands([]);
                  setSelectedPriceRanges([]);
                }}
                className="w-full py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
              >
                Reset Filters
              </button>
            )}

          </aside>

          {/* ─── PRODUCT GRID & PAGINATION ─── */}
          <div className="lg:col-span-9 space-y-8">
            {paginatedProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 text-center">
                <i className="bi bi-search text-4xl text-slate-300 mb-3"></i>
                <h3 className="text-base font-bold text-slate-800">No products found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Try adjusting your filter options or searching for another keyword.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    imageUrl={product.imageUrl}
                    rating={product.rating}
                    reviewsCount={product.reviewsCount}
                    stock={product.stock}
                  />
                ))}
              </div>
            )}

            {/* ─── PAGINATION: < 1 2 3 4 > ─── */}
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                aria-label="Previous Page"
              >
                <i className="bi bi-chevron-left"></i>
              </button>

              {[1, 2, 3, 4].map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                    currentPage === page
                      ? "bg-slate-900 text-white shadow-xs"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(4, p + 1))}
                disabled={currentPage === 4}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                aria-label="Next Page"
              >
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent"></div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}