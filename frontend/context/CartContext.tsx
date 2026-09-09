"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { cartApi, Cart, CartItem } from "../lib/api";

type CartContextType = {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  itemCount: number;
  cartTotal: number;
  fetchCart: () => Promise<void>;
  addToCart: (productId: number, quantity?: number) => Promise<Cart>;
  updateQuantity: (itemId: number, quantity: number) => Promise<Cart>;
  removeItem: (itemId: number) => Promise<Cart>;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const emptyCart = (): Cart => ({ id: 0, items: [], total: 0 });

  const getStorageKey = () => {
    if (typeof window === "undefined") return "shopEaseCart_guest";
    const email = localStorage.getItem("userEmail");
    return email ? `shopEaseCart_${email.toLowerCase()}` : "shopEaseCart_guest";
  };

  const saveLocalCart = (items: CartItem[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(getStorageKey(), JSON.stringify(items));
    }
  };

  const getLocalCart = (): Cart => {
    if (typeof window === "undefined") return emptyCart();
    const saved = localStorage.getItem(getStorageKey());
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const total = parsed.reduce(
            (sum: number, item: CartItem) => sum + (item.product?.price || 0) * item.quantity,
            0
          );
          return { id: 0, items: parsed, total };
        }
      } catch {
        // ignore
      }
    }
    return emptyCart();
  };

  const fetchCart = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      setCart(getLocalCart());
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const cartData = await cartApi.getCart();
      if (cartData && Array.isArray(cartData.items)) {
        setCart(cartData);
        saveLocalCart(cartData.items);
      } else {
        const empty = emptyCart();
        setCart(empty);
        saveLocalCart([]);
      }
    } catch (err: any) {
      console.warn("Cart API offline, using local cart:", err?.message);
      setCart(getLocalCart());
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

  const addToCart = async (productId: number, quantity: number = 1): Promise<Cart> => {
    try {
      setError(null);
      try {
        const updatedCart = await cartApi.addToCart(productId, quantity);
        if (updatedCart && Array.isArray(updatedCart.items)) {
          setCart(updatedCart);
          saveLocalCart(updatedCart.items);
          notifyCartUpdated();
          return updatedCart;
        }
      } catch (apiErr: any) {
        console.warn("addToCart API warning:", apiErr?.message);
      }

      // Local cart fallback
      const current = cart?.items ? [...cart.items] : [];
      const existingIdx = current.findIndex((i) => i.product?.id === productId);

      if (existingIdx > -1) {
        current[existingIdx].quantity += quantity;
      } else {
        current.push({
          id: Date.now(),
          quantity,
          product: {
            id: productId,
            name: "Product #" + productId,
            price: 99.0,
            imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
          },
        });
      }

      const total = current.reduce(
        (sum, item) => sum + (item.product?.price || 0) * item.quantity,
        0
      );
      const newCart = { id: 0, items: current, total };
      setCart(newCart);
      saveLocalCart(current);
      notifyCartUpdated();
      return newCart;
    } catch (err: any) {
      setError(err.message || "Failed to add item to cart");
      throw err;
    }
  };

  const updateQuantity = async (itemId: number, quantity: number): Promise<Cart> => {
    if (quantity <= 0) {
      return removeItem(itemId);
    }
    try {
      setError(null);
      try {
        const updatedCart = await cartApi.updateQuantity(itemId, quantity);
        if (updatedCart && Array.isArray(updatedCart.items)) {
          setCart(updatedCart);
          saveLocalCart(updatedCart.items);
          notifyCartUpdated();
          return updatedCart;
        }
      } catch (apiErr: any) {
        console.warn("updateQuantity API warning:", apiErr?.message);
      }

      const current = cart?.items
        ? cart.items.map((i) => (i.id === itemId ? { ...i, quantity } : i))
        : [];
      const total = current.reduce(
        (sum, item) => sum + (item.product?.price || 0) * item.quantity,
        0
      );
      const newCart = { id: 0, items: current, total };
      setCart(newCart);
      saveLocalCart(current);
      notifyCartUpdated();
      return newCart;
    } catch (err: any) {
      setError(err.message || "Failed to update quantity");
      throw err;
    }
  };

  const removeItem = async (itemId: number): Promise<Cart> => {
    try {
      setError(null);
      try {
        const updatedCart = await cartApi.removeItem(itemId);
        if (updatedCart && Array.isArray(updatedCart.items)) {
          setCart(updatedCart);
          saveLocalCart(updatedCart.items);
          notifyCartUpdated();
          return updatedCart;
        }
      } catch (apiErr: any) {
        console.warn("removeItem API warning:", apiErr?.message);
      }

      const current = cart?.items ? cart.items.filter((i) => i.id !== itemId) : [];
      const total = current.reduce(
        (sum, item) => sum + (item.product?.price || 0) * item.quantity,
        0
      );
      const newCart = { id: 0, items: current, total };
      setCart(newCart);
      saveLocalCart(current);
      notifyCartUpdated();
      return newCart;
    } catch (err: any) {
      setError(err.message || "Failed to remove item");
      throw err;
    }
  };

  const clearCart = () => {
    const empty = emptyCart();
    setCart(empty);
    if (typeof window !== "undefined") {
      localStorage.setItem(getStorageKey(), JSON.stringify([]));
    }
    notifyCartUpdated();
  };

  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const cartTotal = cart?.total || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        itemCount,
        cartTotal,
        fetchCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartContext must be used within a CartProvider");
  }
  return context;
}
