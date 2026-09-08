
"use client";

import Image from "next/image";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../../../hooks/useCart";

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
  category?: Category;
};

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function ProductPage({ params }: ProductPageProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imgSrc, setImgSrc] = useState<string>("");

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(`http://localhost:5000/api/products/${id}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Product not found");
          }
          throw new Error("Failed to load product details");
        }

        const data = await response.json();
        const prod = data.product || data;

        if (prod && prod.id) {
          setProduct(prod);
          setImgSrc(
            prod.imageUrl ||
              prod.image ||
              "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80"
          );
        } else {
          throw new Error("Invalid product data received");
        }
      } catch (err: unknown) {
        console.error("Fetch product error:", err);
        const message = err instanceof Error ? err.message : "Unable to load product.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductDetail();
  }, [id]);

  const maxStock = product?.stock ?? 0;
  const isOutOfStock = maxStock <= 0;

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < maxStock) {
      setQuantity(quantity + 1);
    }
  };

  const handleAddToCart = async () => {
    if (isOutOfStock || isSubmitting || !product) return;

    const token = localStorage.getItem("token");
    if (!token) {
      router.push(`/login?redirect=/products/${id}`);
      return;
    }

    try {
      setIsSubmitting(true);
      await addToCart(product.id, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err: any) {
      alert(err.message || "Failed to add item to cart");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50/50 p-6 md:p-12">
        <div className="mx-auto max-w-5xl">
          <div className="animate-pulse grid gap-8 md:grid-cols-2 bg-white p-6 md:p-8 rounded-2xl border border-gray-200">
            <div className="h-80 w-full bg-gray-200 rounded-xl"></div>
            <div className="flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
                <div className="h-8 w-3/4 bg-gray-200 rounded"></div>
                <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
                <div className="h-24 w-full bg-gray-200 rounded"></div>
              </div>
              <div className="h-12 w-full bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-gray-50/50 p-6 md:p-12">
        <div className="mx-auto max-w-md text-center bg-white p-8 rounded-2xl border border-gray-200 shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-sm text-gray-600 mb-6">{error || "The requested product does not exist or has been removed."}</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition"
          >
            ← Back to Products
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50/50 p-6 md:p-12">
      <div className="mx-auto max-w-5xl">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/products" className="hover:text-blue-600 transition">
            Products
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate">{product.name}</span>
        </nav>

        {/* Product Detail Card */}
        <div className="grid gap-8 md:grid-cols-2 bg-white p-6 md:p-10 rounded-2xl border border-gray-200/80 shadow-sm">
          {/* Product Image */}
          <div className="relative h-80 md:h-96 w-full overflow-hidden rounded-xl bg-gray-100 border border-gray-100">
            <Image
              src={imgSrc}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              onError={() => {
                setImgSrc("https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80");
              }}
            />
          </div>

          {/* Product Details & Actions */}
          <div className="flex flex-col justify-between">
            <div>
              {/* Category */}
              {product.category?.name && (
                <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 mb-3">
                  {product.category.name}
                </span>
              )}

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                {product.name}
              </h1>

              {/* Price & Stock */}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-3xl font-extrabold text-gray-900">
                  ${Number(product.price).toFixed(2)}
                </span>

                <div>
                  {isOutOfStock ? (
                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                      Out of Stock
                    </span>
                  ) : (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                      In Stock: {product.stock} items
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="mt-6 border-t border-gray-100 pt-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">
                  Description
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {product.description || "No product description available."}
                </p>
              </div>
            </div>

            {/* Quantity Selector & Add to Cart */}
            <div className="mt-8 border-t border-gray-100 pt-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                {/* Quantity Control */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">Quantity:</span>
                  <div className="flex items-center rounded-lg border border-gray-300 bg-gray-50 p-1">
                    <button
                      onClick={handleDecrease}
                      disabled={quantity <= 1 || isOutOfStock}
                      className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-gray-700 font-bold shadow-2xs hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-bold text-gray-900">
                      {quantity}
                    </span>
                    <button
                      onClick={handleIncrease}
                      disabled={quantity >= maxStock || isOutOfStock}
                      className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-gray-700 font-bold shadow-2xs hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 rounded-xl px-6 py-3 font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                    isOutOfStock
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : added
                      ? "bg-emerald-600 text-white shadow-md"
                      : "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
                  }`}
                >
                  {isOutOfStock ? (
                    "Out of Stock"
                  ) : added ? (
                    <>
                      ✓ Added {quantity} to Cart
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Add to Cart (${(product.price * quantity).toFixed(2)})
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

