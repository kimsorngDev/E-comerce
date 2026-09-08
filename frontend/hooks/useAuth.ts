"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export function useAuth(requireAuth: boolean = false) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const checkAuth = useCallback(() => {
    if (typeof window === "undefined") return;

    const storedToken = localStorage.getItem("token");
    const loggedIn = localStorage.getItem("isLoggedIn") === "true" && !!storedToken;

    setToken(storedToken);
    setIsLoggedIn(loggedIn);
    setLoading(false);

    if (requireAuth && !loggedIn) {
      router.push("/login?redirect=" + encodeURIComponent(window.location.pathname));
    }
  }, [requireAuth, router]);

  useEffect(() => {
    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, [checkAuth]);

  return { isLoggedIn, token, loading };
}
