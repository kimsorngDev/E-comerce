"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../hooks/useCart";

export type ProductCardProps = {
  id: number;
  name: string;
  price: number;
  image?: string | null;
  imageUrl?: string | null;
  stock?: number;
  category?: {
    id: number;
    name: string;
  } | null;
};

export default function ProductCard({
  id,
  name,
  price,
  image,
  imageUrl,
  stock = 0,
  category,
}: ProductCardProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const displayImage = imageUrl || image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80";
  const [imgSrc, setImgSrc] = useState(displayImage);
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);

  const isOutOfStock = stock <= 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || loading) return;

    const token = localStorage.getItem("token");
    if (!token) {
      router.push(`/login?redirect=/products/${id}`);
      return;
    }

    try {
      setLoading(true);
      await addToCart(id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch (err: any) {
      alert(err.message || "Failed to add product to cart");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/products/${id}`} className="flex flex-col flex-1">
        {/* Product Image */}
        <div className="relative h-48 w-full overflow-hidden bg-gray-100">
          <Image
            src={imgSrc}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => {
              setImgSrc("https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80");
            }}
          />
          {/* Stock Badge */}
          <div className="absolute top-3 right-3">
            {isOutOfStock ? (
              <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700 shadow-sm">
                Out of Stock
              </span>
            ) : (
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 shadow-sm">
                In Stock ({stock})
              </span>
            )}
          </div>

          {/* Category Badge */}
          {category?.name && (
            <div className="absolute bottom-3 left-3">
              <span className="rounded-md bg-black/60 px-2 py-0.5 text-xs text-white backdrop-blur-xs">
                {category.name}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-4">
          <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
            {name}
          </h2>

          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-bold text-gray-900">
              ${Number(price).toFixed(2)}
            </span>
          </div>
        </div>
      </Link>

      {/* Footer / Add to Cart */}
      <div className="p-4 pt-0">
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`w-full rounded-lg px-4 py-2.5 font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
            isOutOfStock
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : added
              ? "bg-emerald-600 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow"
          }`}
        >
          {isOutOfStock ? (
            "Unavailable"
          ) : added ? (
            <>
              ✓ Added to Cart
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}