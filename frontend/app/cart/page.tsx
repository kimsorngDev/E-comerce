"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";

export default function CartPage() {
  const { isLoggedIn, loading: authLoading } = useAuth(true);
  const { cart, loading: cartLoading, error, updateQuantity, removeItem } = useCart();
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  if (authLoading || cartLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-gray-500 font-medium">Loading your shopping cart...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null; // Redirect handled by useAuth
  }

  const items = cart?.items || [];
  const subtotal = cart?.total || 0;
  const shippingFee = subtotal > 0 ? (subtotal > 100 ? 0 : 10) : 0;
  const total = subtotal + shippingFee;

  const handleQuantityChange = async (itemId: number, newQty: number) => {
    try {
      setUpdatingId(itemId);
      await updateQuantity(itemId, newQty);
    } catch (err) {
      // Error handled by hook
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (itemId: number) => {
    if (window.confirm("Are you sure you want to remove this item from your cart?")) {
      try {
        setUpdatingId(itemId);
        await removeItem(itemId);
      } catch (err) {
        // Error handled by hook
      } finally {
        setUpdatingId(null);
      }
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Shopping Cart</h1>
        <p className="mt-2 text-sm text-gray-500">
          Review your cart items, adjust quantities, or proceed to checkout.
        </p>
      </div>

      {error && (
        <div className="mt-6 rounded-md bg-red-50 p-4 border border-red-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="bi bi-exclamation-triangle-fill text-red-500 text-lg"></i>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Cart Action Failed</h3>
              <div className="mt-1 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Your cart is empty</h2>
          <p className="mt-2 text-sm text-gray-500 max-w-sm">
            Looks like you haven't added anything to your cart yet. Explore our top products and start shopping!
          </p>
          <div className="mt-6">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              Browse Products
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
          {/* Cart Items List */}
          <section className="lg:col-span-7">
            <ul role="list" className="divide-y divide-gray-200 border-t border-b border-gray-200">
              {items.map((item) => {
                const product = item.product;
                if (!product) return null;

                const isUpdating = updatingId === item.id;
                const defaultImg = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80";

                return (
                  <li key={item.id} className="flex py-6 sm:py-8">
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-100 sm:h-32 sm:w-32">
                      <Image
                        src={product.imageUrl || defaultImg}
                        alt={product.name}
                        fill
                        className="object-cover object-center"
                        onError={(e) => {
                          (e.target as any).src = defaultImg;
                        }}
                      />
                    </div>

                    <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                      <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                        <div>
                          <div className="flex justify-between">
                            <h3 className="text-base font-medium text-gray-900 hover:text-blue-600">
                              <Link href={`/products/${product.id}`}>{product.name}</Link>
                            </h3>
                          </div>
                          <p className="mt-1 text-sm font-semibold text-gray-900">
                            ${Number(product.price).toFixed(2)}
                          </p>
                        </div>

                        <div className="mt-4 sm:mt-0 sm:pr-9">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={isUpdating || item.quantity <= 1}
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-sm font-semibold text-gray-800">
                              {isUpdating ? "..." : item.quantity}
                            </span>
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                            >
                              +
                            </button>
                          </div>

                          <div className="absolute top-0 right-0">
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleRemove(item.id)}
                              className="-m-2 inline-flex p-2 text-gray-400 hover:text-red-500 transition-colors"
                              title="Remove item"
                            >
                              <span className="sr-only">Remove</span>
                              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-sm">
                        <p className="text-gray-500">
                          Subtotal: <span className="font-semibold text-gray-900">${(Number(product.price) * item.quantity).toFixed(2)}</span>
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Order Summary Display */}
          <section className="mt-16 rounded-xl bg-gray-50 p-6 sm:p-8 lg:col-span-5 lg:mt-0 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>

            <dl className="mt-6 space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-gray-600">Items Subtotal</dt>
                <dd className="font-medium text-gray-900">${subtotal.toFixed(2)}</dd>
              </div>

              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <dt className="flex items-center text-gray-600">
                  <span>Shipping Estimate</span>
                </dt>
                <dd className="font-medium text-gray-900">
                  {shippingFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `$${shippingFee.toFixed(2)}`}
                </dd>
              </div>

              {subtotal > 0 && subtotal < 100 && (
                <p className="text-xs text-blue-600">
                  Add ${(100 - subtotal).toFixed(2)} more for FREE shipping!
                </p>
              )}

              <div className="flex items-center justify-between border-t border-gray-200 pt-4 text-base font-bold text-gray-900">
                <dt>Order Total</dt>
                <dd className="text-xl text-blue-600">${total.toFixed(2)}</dd>
              </div>
            </dl>

            <div className="mt-6">
              <Link
                href="/checkout"
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-blue-700 transition-all duration-200"
              >
                Proceed to Checkout
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>

            <div className="mt-4 text-center">
              <Link href="/products" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                Or Continue Shopping &rarr;
              </Link>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
