"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchApi } from "../lib/api";
import ProductCard from "../components/ProductCard";
import { PRODUCTS, CATEGORIES, Product } from "./data/products";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await fetchApi("/products");
        if (data.products && Array.isArray(data.products) && data.products.length > 0) {
          // Merge or supplement with full mock data so UI remains complete
          setProducts(data.products);
        }
      } catch (err) {
        // Fallback gracefully to rich mock data
        setProducts(PRODUCTS);
      }
    }
    loadProducts();
  }, []);

  // Featured 4 products matching the exact mockup
  const featuredProducts = [
    products.find((p) => p.name === "Smart Watch") || PRODUCTS[4],
    products.find((p) => p.name === "Running Shoes") || PRODUCTS[5],
    products.find((p) => p.name === "Bluetooth Headphones") || PRODUCTS[6],
    products.find((p) => p.name === "Backpack") || PRODUCTS[7],
  ];

  const categoryList = [
    { name: "Electronics", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80", slug: "electronics" },
    { name: "Fashion", image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=200&q=80", slug: "fashion" },
    { name: "Home & Living", image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=200&q=80", slug: "home-living" },
    { name: "Beauty", image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=200&q=80", slug: "beauty" },
    { name: "Sports", image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=200&q=80", slug: "sports" },
    { name: "More", isMore: true, slug: "all" },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] py-6 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">

        {/* ─── 1. HERO BANNER: Better Tech Better Life ─── */}
        <section className="relative overflow-hidden rounded-3xl bg-[#0f172a] text-white shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            
            {/* Left Copy */}
            <div className="p-8 sm:p-12 lg:p-16 lg:col-span-6 space-y-5">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] text-white">
                Better Tech <br />
                Better Life
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-md leading-relaxed">
                Discover the latest electronics, fashion, home essentials and more — all in one place.
              </p>
              <div className="pt-2">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-slate-900 shadow-md hover:bg-slate-100 transition-all active:scale-95"
                >
                  Shop Now
                  <i className="bi bi-arrow-right"></i>
                </Link>
              </div>
            </div>

            {/* Right Tech Image */}
            <div className="relative h-64 sm:h-80 lg:h-[420px] lg:col-span-6 w-full">
              <Image
                src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80"
                alt="Modern Tech Lifestyle"
                fill
                priority
                className="object-cover object-center lg:rounded-r-3xl opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent lg:bg-gradient-to-r lg:from-[#0f172a] lg:via-transparent lg:to-transparent" />
            </div>

          </div>
        </section>

        {/* ─── 2. VALUE PROPOSITIONS / TRUST STRIP ─── */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-2">
          {/* Free Shipping */}
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-800">
              <i className="bi bi-truck text-2xl"></i>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Free Shipping</h4>
              <p className="text-xs text-slate-500 mt-0.5">On orders over $50</p>
            </div>
          </div>

          {/* Secure Payment */}
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-800">
              <i className="bi bi-shield-check text-2xl"></i>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Secure Payment</h4>
              <p className="text-xs text-slate-500 mt-0.5">100% secure checkout</p>
            </div>
          </div>

          {/* 24/7 Support */}
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-800">
              <i className="bi bi-headset text-2xl"></i>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">24/7 Support</h4>
              <p className="text-xs text-slate-500 mt-0.5">We&apos;re here to help</p>
            </div>
          </div>
        </section>

        {/* ─── 3. SHOP BY CATEGORY ─── */}
        <section className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Shop by Category
          </h2>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 sm:gap-6">
            {categoryList.map((cat) => (
              <Link
                key={cat.name}
                href={`/products?category=${cat.slug}`}
                className="group flex flex-col items-center gap-3 text-center"
              >
                <div className="relative flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-slate-100 border border-slate-200/80 p-1 shadow-2xs transition-all duration-300 group-hover:scale-105 group-hover:border-slate-400 group-hover:shadow-md">
                  {cat.isMore ? (
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-200/80 text-slate-700">
                      <i className="bi bi-three-dots text-2xl"></i>
                    </div>
                  ) : (
                    <div className="relative h-full w-full overflow-hidden rounded-full">
                      <Image
                        src={cat.image || ""}
                        alt={cat.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                  )}
                </div>
                <span className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-slate-950">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ─── 4. FEATURED PRODUCTS ─── */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Featured Products
            </h2>
            <Link
              href="/products"
              className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 group"
            >
              View All
              <i className="bi bi-arrow-right transition-transform group-hover:translate-x-1"></i>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
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
        </section>

        {/* ─── 5. PROMO BANNER: Up to 50% Off ─── */}
        <section className="relative overflow-hidden rounded-3xl bg-[#0f172a] text-white shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-12 items-center">
            
            {/* Left Content */}
            <div className="p-8 sm:p-12 md:col-span-7 space-y-4">
              <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Up to 50% Off <br />
                on Selected Items
              </h3>
              <div className="pt-2">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-xs sm:text-sm font-bold text-slate-900 hover:bg-slate-100 transition-all shadow-md active:scale-95"
                >
                  Shop Now
                </Link>
              </div>
            </div>

            {/* Right Headphones/Lifestyle Photo */}
            <div className="relative h-48 sm:h-64 md:h-72 md:col-span-5 w-full">
              <Image
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
                alt="Promo Model Headphones"
                fill
                className="object-cover object-center md:rounded-r-3xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent md:bg-gradient-to-r md:from-[#0f172a] md:via-transparent md:to-transparent" />
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}