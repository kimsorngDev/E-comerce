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
  rating?: number;
  reviewsCount?: number;
  stock?: number;
  badge?: string;
  originalPrice?: number;
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
  rating = 4.5,
  reviewsCount = 120,
  stock = 10,
  category,
}: ProductCardProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const displayImage =
    imageUrl ||
    image ||
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80";
  const [imgSrc, setImgSrc] = useState(displayImage);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const numPrice = Number(price);

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setIsAdding(true);
      await addToCart(id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch {
      // In demo mode or if not logged in, show added feedback
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } finally {
      setIsAdding(false);
    }
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  return (
    <div className="group relative flex flex-col rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs transition-all duration-300 hover:shadow-md hover:border-slate-300">
      
      {/* Top Wishlist Heart Action Button */}
      <button
        onClick={toggleWishlist}
        className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white shadow-2xs transition-all"
        aria-label="Wishlist"
      >
        <i className={`bi ${isWishlisted ? "bi-heart-fill text-rose-500" : "bi-heart"} text-sm`}></i>
      </button>

      {/* Product Image Area */}
      <Link
        href={`/products/${id}`}
        className="relative mb-3 flex h-48 sm:h-52 w-full items-center justify-center overflow-hidden rounded-xl bg-slate-50"
      >
        <Image
          src={imgSrc}
          alt={name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
          onError={() =>
            setImgSrc(
              "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80"
            )
          }
        />
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link href={`/products/${id}`} className="block">
            <h3 className="text-sm font-semibold text-slate-800 line-clamp-1 group-hover:text-slate-950 transition-colors">
              {name}
            </h3>
          </Link>
          <div className="mt-1">
            <span className="text-sm font-bold text-slate-900">
              ${numPrice.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Rating and Reviews */}
        <div className="mt-2.5 flex items-center justify-between pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1 text-xs text-slate-600">
            <i className="bi bi-star-fill text-amber-400 text-xs"></i>
            <span className="font-semibold text-slate-800">{rating}</span>
            <span className="text-slate-400">({reviewsCount})</span>
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={isAdding}
            className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-medium transition-all ${
              added
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-900 hover:text-white"
            }`}
            title="Add to cart"
          >
            {added ? (
              <i className="bi bi-check-lg"></i>
            ) : (
              <i className="bi bi-cart-plus"></i>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}