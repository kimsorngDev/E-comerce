"use client";

import { useState, useEffect, useCallback } from "react";
import { cartApi, Cart, CartItem } from "../lib/api";

export function useCart() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setCart({ id: 0, items: [], total: 0 });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const cartData = await cartApi.getCart();
      setCart(cartData);
    } catch (err: any) {
      console.error("Failed to fetch cart:", err);
      if (err.message && (err.message.includes("User not found") || err.message.includes("jwt") || err.message.includes("token"))) {
        localStorage.removeItem("token");
        localStorage.removeItem("isLoggedIn");
        window.dispatchEvent(new Event("storage"));
        setCart({ id: 0, items: [], total: 0 });
      } else {
        setError(err.message || "Failed to load cart");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
    
    const handleCartUpdate = () => fetchCart();
    window.addEventListener("cart-updated", handleCartUpdate);
    window.addEventListener("storage", handleCartUpdate);

    return () => {
      window.removeEventListener("cart-updated", handleCartUpdate);
      window.removeEventListener("storage", handleCartUpdate);
    };
  }, [fetchCart]);

  const notifyCartUpdated = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("cart-updated"));
    }
  };

  const addToCart = async (productId: number, quantity: number = 1) => {
    try {
      setError(null);
      const updatedCart = await cartApi.addToCart(productId, quantity);
      setCart(updatedCart);
      notifyCartUpdated();
      return updatedCart;
    } catch (err: any) {
      setError(err.message || "Failed to add item to cart");
      throw err;
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      return removeItem(itemId);
    }
    try {
      setError(null);
      const updatedCart = await cartApi.updateQuantity(itemId, quantity);
      setCart(updatedCart);
      notifyCartUpdated();
      return updatedCart;
    } catch (err: any) {
      setError(err.message || "Failed to update quantity");
      throw err;
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      setError(null);
      const updatedCart = await cartApi.removeItem(itemId);
      setCart(updatedCart);
      notifyCartUpdated();
      return updatedCart;
    } catch (err: any) {
      setError(err.message || "Failed to remove item");
      throw err;
    }
  };

  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const cartTotal = cart?.total || 0;

  return {
    cart,
    loading,
    error,
    itemCount,
    cartTotal,
    fetchCart,
    addToCart,
    updateQuantity,
    removeItem,
  };
}
