"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../../hooks/useCart";
import { INITIAL_CART_ITEMS } from "../data/products";

interface LocalCartItem {
  id: number;
  product: {
    id: number;
    name: string;
    price: number;
    imageUrl: string;
  };
  quantity: number;
  color?: string;
  size?: string;
}

export default function CartPage() {
  const router = useRouter();
  const { cart, updateQuantity: hookUpdateQty, removeItem: hookRemoveItem } = useCart();
  
  const items: LocalCartItem[] = (cart?.items || []).map((item) => ({
    id: item.id,
    product: {
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      imageUrl: item.product.imageUrl || "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80",
    },
    quantity: item.quantity,
    color: "Black",
  }));

  const handleQtyChange = async (itemId: number, newQty: number) => {
    if (newQty < 1) return;
    try {
      await hookUpdateQty(itemId, newQty);
    } catch (err) {
      console.warn("Quantity update error:", err);
    }
  };

  const handleRemove = async (itemId: number) => {
    try {
      await hookRemoveItem(itemId);
    } catch (err) {
      console.warn("Remove item error:", err);
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const total = subtotal; // Free shipping

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Your Cart <span className="text-slate-500 font-normal">({items.length} items)</span>
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-16 text-center shadow-2xs">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
              <i className="bi bi-cart-x text-3xl"></i>
            </div>
            <h2 className="text-lg font-bold text-slate-900">Your cart is empty</h2>
            <p className="mt-1 text-sm text-slate-500 max-w-xs">
              Explore our curated store to find great deals and add items to your cart.
            </p>
            <div className="mt-6">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white hover:bg-slate-800 transition-all shadow-sm"
              >
                Browse Products
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* ─── LEFT: CART ITEM LIST ─── */}
            <div className="lg:col-span-8 space-y-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs"
                  >
                    {/* Item Thumbnail & Info */}
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="relative h-20 w-20 sm:h-22 sm:w-22 shrink-0 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center p-2">
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          fill
                          className="object-contain p-1"
                        />
                      </div>

                      <div className="space-y-1">
                        <Link
                          href={`/products/${item.product.id}`}
                          className="text-sm sm:text-base font-bold text-slate-900 hover:underline"
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-sm font-semibold text-slate-900">
                          ${item.product.price.toFixed(2)}
                        </p>
                        {item.color && (
                          <p className="text-xs text-slate-500">Color: {item.color}</p>
                        )}
                        {item.size && (
                          <p className="text-xs text-slate-500">Size: {item.size}</p>
                        )}
                      </div>
                    </div>

                    {/* Quantity Stepper & Price / Delete */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      
                      {/* Quantity Stepper: [ - 1 + ] */}
                      <div className="flex items-center h-10 rounded-xl border border-slate-200 bg-slate-50 px-2">
                        <button
                          onClick={() => handleQtyChange(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="flex h-7 w-7 items-center justify-center text-slate-600 hover:text-slate-900 disabled:opacity-30"
                          aria-label="Decrease quantity"
                        >
                          <i className="bi bi-dash text-base"></i>
                        </button>
                        <span className="w-8 text-center text-xs sm:text-sm font-bold text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQtyChange(item.id, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center text-slate-600 hover:text-slate-900"
                          aria-label="Increase quantity"
                        >
                          <i className="bi bi-plus text-base"></i>
                        </button>
                      </div>

                      {/* Line Subtotal */}
                      <div className="text-right min-w-[80px]">
                        <span className="text-sm sm:text-base font-bold text-slate-900">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>

                      {/* Trash Delete Icon */}
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Remove item"
                        aria-label="Remove item"
                      >
                        <i className="bi bi-trash text-lg"></i>
                      </button>
                    </div>

                  </div>
                ))}
              </div>

              {/* Continue Shopping Button on bottom left */}
              <div className="pt-2">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
                >
                  <i className="bi bi-arrow-left"></i>
                  Continue Shopping
                </Link>
              </div>
            </div>

            {/* ─── RIGHT: ORDER SUMMARY CARD ─── */}
            <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-6">
              <div className="space-y-3 pb-4 border-b border-slate-100">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Shipping</span>
                  <span className="font-semibold text-emerald-600">Free</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between text-base sm:text-lg font-bold text-slate-900">
                <span>Total</span>
                <span className="text-xl sm:text-2xl">${total.toFixed(2)}</span>
              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                className="w-full flex h-12 items-center justify-center gap-2 rounded-xl bg-[#0f172a] text-sm font-bold text-white hover:bg-slate-800 transition-all shadow-md active:scale-98"
              >
                <i className="bi bi-shield-lock"></i>
                Checkout
              </Link>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
