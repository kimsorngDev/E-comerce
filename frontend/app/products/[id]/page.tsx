"use client";

import Image from "next/image";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../../../hooks/useCart";
import { fetchApi } from "../../../lib/api";
import ProductCard from "../../../components/ProductCard";
import { PRODUCTS, getProductById, Product } from "../../data/products";

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function ProductDetailsPage({ params }: ProductPageProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { id } = use(params);

  const [product, setProduct] = useState<Product>(() => getProductById(id) || PRODUCTS[0]);
  const [selectedImage, setSelectedImage] = useState<string>(() => getProductById(id)?.imageUrl || PRODUCTS[0].imageUrl);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stockWarning, setStockWarning] = useState("");

  useEffect(() => {
    async function loadProduct() {
      const mockProd = getProductById(id) || PRODUCTS[0];
      if (mockProd) {
        setProduct(mockProd);
        setSelectedImage(mockProd.imageUrl);
      }
      try {
        const data = await fetchApi<{ product: any }>(`/products/${id}`);
        const apiProd = data.product || data;
        if (apiProd && apiProd.id) {
          setProduct({
            ...mockProd,
            ...apiProd,
            specs: mockProd?.specs || {
              brand: apiProd.brand || "Brand",
              model: apiProd.name || "Model",
              storage: "128GB",
              color: "Black",
              condition: "New",
            },
            galleryImages: mockProd?.galleryImages || [apiProd.imageUrl || apiProd.image],
          });
          setSelectedImage(apiProd.imageUrl || apiProd.image || mockProd?.imageUrl || "");
        }
      } catch {
        // use rich mock fallback
      }
    }
    loadProduct();
  }, [id]);

  const maxStock = product.stock ?? 10;
  const isOutOfStock = maxStock <= 0;

  const gallery = product.galleryImages && product.galleryImages.length > 0
    ? product.galleryImages
    : [product.imageUrl];

  const handleDecrease = () => {
    setStockWarning("");
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity >= maxStock) {
      setStockWarning(`Maximum available stock is ${maxStock} units.`);
      return;
    }
    setStockWarning("");
    setQuantity(quantity + 1);
  };

  const handleAddToCart = async () => {
    if (isOutOfStock) {
      setStockWarning("This product is currently out of stock.");
      return;
    }
    try {
      setLoading(true);
      await addToCart(product.id, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) {
      setStockWarning("This product is currently out of stock.");
      return;
    }
    try {
      await addToCart(product.id, quantity);
    } catch {
      // ignore
    }
    router.push("/cart");
  };

  // 4 "You May Also Like" items matching mockup
  const relatedProducts = [
    PRODUCTS.find((p) => p.name === "iPhone 14") || PRODUCTS[10],
    PRODUCTS.find((p) => p.name === "Samsung Galaxy S23") || PRODUCTS[11],
    PRODUCTS.find((p) => p.name === "iPad Air") || PRODUCTS[12],
    PRODUCTS.find((p) => p.name === "Apple Watch SE") || PRODUCTS[13],
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* ─── BREADCRUMB ─── */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
          <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
          <span>&gt;</span>
          <Link href={`/products?category=${product.category?.slug || "electronics"}`} className="hover:text-slate-900 transition-colors">
            {product.category?.name || "Electronics"}
          </Link>
          <span>&gt;</span>
          <span className="font-semibold text-slate-900">{product.name}</span>
        </nav>

        {/* ─── MAIN PRODUCT DETAILS GRID ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Gallery (Thumbnails column + Main Image) */}
          <div className="lg:col-span-7 flex flex-col sm:flex-row gap-4">
            
            {/* Thumbnail Column */}
            <div className="flex sm:flex-col gap-3 order-2 sm:order-1 overflow-x-auto sm:overflow-visible shrink-0">
              {gallery.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(img)}
                  className={`relative h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden border-2 bg-white p-1 transition-all ${
                    (selectedImage || product.imageUrl) === img
                      ? "border-slate-900 shadow-xs"
                      : "border-slate-200 hover:border-slate-400"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    fill
                    className="object-contain p-1"
                  />
                </button>
              ))}
            </div>

            {/* Main Featured Image Card */}
            <div className="relative flex-1 h-80 sm:h-[480px] rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs flex items-center justify-center order-1 sm:order-2">
              <Image
                src={selectedImage || product.imageUrl}
                alt={product.name}
                fill
                priority
                className="object-contain p-6 transition-all duration-300"
              />
            </div>

          </div>

          {/* Right Product Overview & Buy Box */}
          <div className="lg:col-span-5 space-y-6">
            
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                {product.name}
              </h1>

              {/* Rating and Reviews */}
              <div className="mt-2.5 flex items-center gap-2 text-sm text-slate-600">
                <div className="flex items-center text-amber-400 text-sm">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className={`bi bi-star-fill ${i < Math.floor(product.rating) ? "text-amber-400" : "text-slate-200"}`}></i>
                  ))}
                </div>
                <span className="font-bold text-slate-900">{product.rating}</span>
                <span className="text-slate-400">({product.reviewsCount} reviews)</span>
              </div>

              {/* Price */}
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-slate-900">
                  ${product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <span className="text-sm font-medium text-slate-400 line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>

              {/* In Stock or Out of Stock Badge */}
              <div className="mt-3 flex items-center gap-2">
                {isOutOfStock ? (
                  <>
                    <span className="flex h-2 w-2 rounded-full bg-rose-500"></span>
                    <span className="text-xs font-semibold text-rose-700">Out of Stock</span>
                  </>
                ) : (
                  <>
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                    <span className="text-xs font-semibold text-emerald-700">
                      In Stock ({maxStock} available)
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-600 leading-relaxed">
              {product.description}
            </p>

            {stockWarning && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 font-medium">
                {stockWarning}
              </div>
            )}

            {/* Quantity Stepper & Add to Cart Button */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-4">
                
                {/* Quantity Stepper: [ - 1 + ] */}
                <div className="flex items-center h-12 rounded-xl border border-slate-200 bg-white px-2 shadow-2xs">
                  <button
                    onClick={handleDecrease}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="flex h-8 w-8 items-center justify-center text-slate-600 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <i className="bi bi-dash text-lg"></i>
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-slate-900">
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncrease}
                    disabled={quantity >= maxStock || isOutOfStock}
                    className="flex h-8 w-8 items-center justify-center text-slate-600 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <i className="bi bi-plus text-lg"></i>
                  </button>
                </div>

                {/* Dark Navy Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={loading || isOutOfStock}
                  className={`flex-1 flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    added
                      ? "bg-emerald-600 text-white"
                      : "bg-[#0f172a] text-white hover:bg-slate-800 active:scale-98"
                  }`}
                >
                  {isOutOfStock ? (
                    "Out of Stock"
                  ) : added ? (
                    <>
                      <i className="bi bi-check-lg text-base"></i>
                      Added to Cart
                    </>
                  ) : (
                    <>
                      <i className="bi bi-cart-plus text-base"></i>
                      Add to Cart
                    </>
                  )}
                </button>
              </div>

              {/* Buy Now Button */}
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="w-full h-12 rounded-xl border-2 border-slate-900 bg-transparent text-sm font-bold text-slate-900 hover:bg-slate-900 hover:text-white transition-all active:scale-98 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>
            </div>

            {/* 3 Trust Badges Strip */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-200">
              <div className="flex flex-col items-center text-center p-2">
                <i className="bi bi-truck text-slate-700 text-lg mb-1"></i>
                <span className="text-[11px] font-bold text-slate-800">Free Shipping</span>
                <span className="text-[10px] text-slate-500">On orders over $50</span>
              </div>
              <div className="flex flex-col items-center text-center p-2 border-x border-slate-100">
                <i className="bi bi-award text-slate-700 text-lg mb-1"></i>
                <span className="text-[11px] font-bold text-slate-800">Warranty</span>
                <span className="text-[10px] text-slate-500">1 year official warranty</span>
              </div>
              <div className="flex flex-col items-center text-center p-2">
                <i className="bi bi-shield-check text-slate-700 text-lg mb-1"></i>
                <span className="text-[11px] font-bold text-slate-800">Secure Payment</span>
                <span className="text-[10px] text-slate-500">100% secure</span>
              </div>
            </div>

          </div>

        </div>

        {/* ─── PRODUCT DETAILS SPECIFICATIONS TABLE ─── */}
        <section className="space-y-4 pt-4">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Product Details
          </h2>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
            <table className="w-full text-left text-sm">
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/50">
                  <td className="w-1/3 px-6 py-3.5 font-medium text-slate-500 bg-slate-50/70">Brand</td>
                  <td className="w-2/3 px-6 py-3.5 font-semibold text-slate-900">{product.specs.brand || product.brand}</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="w-1/3 px-6 py-3.5 font-medium text-slate-500 bg-slate-50/70">Model</td>
                  <td className="w-2/3 px-6 py-3.5 font-semibold text-slate-900">{product.specs.model || product.name}</td>
                </tr>
                {product.specs.storage && product.specs.storage !== "N/A" && (
                  <tr className="hover:bg-slate-50/50">
                    <td className="w-1/3 px-6 py-3.5 font-medium text-slate-500 bg-slate-50/70">Storage</td>
                    <td className="w-2/3 px-6 py-3.5 font-semibold text-slate-900">{product.specs.storage}</td>
                  </tr>
                )}
                <tr className="hover:bg-slate-50/50">
                  <td className="w-1/3 px-6 py-3.5 font-medium text-slate-500 bg-slate-50/70">Color</td>
                  <td className="w-2/3 px-6 py-3.5 font-semibold text-slate-900">{product.specs.color || "Black"}</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="w-1/3 px-6 py-3.5 font-medium text-slate-500 bg-slate-50/70">Condition</td>
                  <td className="w-2/3 px-6 py-3.5 font-semibold text-slate-900">{product.specs.condition || "New"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ─── YOU MAY ALSO LIKE ─── */}
        <section className="space-y-6 pt-6">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            You May Also Like
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                price={p.price}
                imageUrl={p.imageUrl}
                rating={p.rating}
                reviewsCount={p.reviewsCount}
                stock={p.stock}
              />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
