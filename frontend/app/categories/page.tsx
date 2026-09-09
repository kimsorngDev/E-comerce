"use client";

import Image from "next/image";
import Link from "next/link";
import { CATEGORIES, PRODUCTS } from "../data/products";

export default function CategoriesPage() {
  const categoryDetails = [
    {
      id: 1,
      name: "Electronics",
      slug: "electronics",
      description: "Cutting-edge smartphones, laptops, audio gear, and smart accessories engineered for performance.",
      itemCount: PRODUCTS.filter((p) => p.category.slug === "electronics").length * 3 + 8,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
      featuredItems: ["iPhone 15", "MacBook Air", "AirPods Pro", "Smart Watch"],
    },
    {
      id: 2,
      name: "Fashion",
      slug: "fashion",
      description: "Contemporary apparel, premium footwear, modern backpacks, and designer sunglasses for everyday elegance.",
      itemCount: PRODUCTS.filter((p) => p.category.slug === "fashion").length * 3 + 6,
      image: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80",
      featuredItems: ["Backpack", "T-shirt", "Sunglasses", "Running Shoes"],
    },
    {
      id: 3,
      name: "Home & Living",
      slug: "home-living",
      description: "Thoughtfully crafted decor, minimalist furniture, lighting, and ambient essentials for modern spaces.",
      itemCount: 16,
      image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
      featuredItems: ["Modern Lamp", "Lounge Chair", "Ceramic Vases", "Aroma Diffuser"],
    },
    {
      id: 4,
      name: "Beauty",
      slug: "beauty",
      description: "Premium skincare, signature fragrances, and self-care essentials for radiant everyday wellness.",
      itemCount: 12,
      image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
      featuredItems: ["Hydrating Serum", "Signature Eau De Parfum", "Night Cream"],
    },
    {
      id: 5,
      name: "Sports",
      slug: "sports",
      description: "High-performance athletic gear, running sneakers, and training accessories to elevate your workout.",
      itemCount: PRODUCTS.filter((p) => p.category.slug === "sports").length * 3 + 7,
      image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80",
      featuredItems: ["Running Shoes", "Fitness Band", "Gym Duffel", "Water Bottle"],
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] py-10 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        
        {/* Header Banner */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="inline-block rounded-full bg-slate-100 px-3.5 py-1 text-xs font-bold text-slate-700">
            Departments & Collections
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
            Shop by Category
          </h1>
          <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
            Browse our wide selection of handpicked products across electronics, fashion, home essentials, beauty, and active sports.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categoryDetails.map((cat) => (
            <div
              key={cat.id}
              className="group relative flex flex-col rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-2xs transition-all duration-300 hover:shadow-xl hover:border-slate-300 hover:-translate-y-1"
            >
              {/* Category Image */}
              <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-slate-100">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                
                <div className="absolute top-4 right-4">
                  <span className="rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-xs font-bold text-slate-900 shadow-sm">
                    {cat.itemCount} Items
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h2 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm">
                    {cat.name}
                  </h2>
                </div>
              </div>

              {/* Category Details */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {cat.description}
                </p>

                {/* Popular Tags */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Popular in this category:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.featuredItems.map((item) => (
                      <span
                        key={item}
                        className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action CTA */}
                <div className="pt-2 border-t border-slate-100">
                  <Link
                    href={`/products?category=${cat.slug}`}
                    className="inline-flex items-center justify-between w-full rounded-xl bg-slate-900 px-4 py-3 text-xs sm:text-sm font-bold text-white hover:bg-slate-800 transition-all shadow-sm"
                  >
                    <span>Browse {cat.name}</span>
                    <i className="bi bi-arrow-right transition-transform group-hover:translate-x-1"></i>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="rounded-3xl bg-[#0f172a] p-8 sm:p-12 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Can&apos;t find what you&apos;re looking for?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg">
              Explore our entire product catalog or search directly for specific brands and specifications.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-xs sm:text-sm font-bold text-slate-900 hover:bg-slate-100 transition-all shadow-md shrink-0"
          >
            View All Products
            <i className="bi bi-arrow-right"></i>
          </Link>
        </div>

      </div>
    </div>
  );
}
