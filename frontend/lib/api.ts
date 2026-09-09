const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
}

export async function fetchApi<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok || data.success === false) {
    const errorMsg = data.message || `API error: ${res.status}`;
    if (
      res.status === 401 ||
      errorMsg === "User not found" ||
      errorMsg === "Invalid or expired token" ||
      errorMsg === "Authentication required"
    ) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userName");
        localStorage.removeItem("isAdmin");
        localStorage.removeItem("adminEmail");
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new Event("cart-updated"));
      }
    }
    throw new Error(errorMsg);
  }

  return data;
}

export interface CartItem {
  id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    imageUrl?: string;
    stock?: number;
  };
}

export interface Cart {
  id: number;
  items: CartItem[];
  total: number;
}

export interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    name: string;
    imageUrl?: string;
  };
}

export interface Order {
  id: number;
  userId: number;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
  shippingInfo?: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    phone: string;
  };
}

export const cartApi = {
  getCart: async (): Promise<Cart> => {
    const res = await fetchApi<{ success: boolean; cart: Cart }>("/cart");
    return res.cart;
  },
  addToCart: async (productId: number, quantity: number = 1): Promise<Cart> => {
    const res = await fetchApi<{ success: boolean; cart: Cart }>("/cart/items", {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    });
    return res.cart;
  },
  updateQuantity: async (itemId: number, quantity: number): Promise<Cart> => {
    const res = await fetchApi<{ success: boolean; cart: Cart }>(`/cart/items/${itemId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    });
    return res.cart;
  },
  removeItem: async (itemId: number): Promise<Cart> => {
    const res = await fetchApi<{ success: boolean; cart: Cart }>(`/cart/items/${itemId}`, {
      method: "DELETE",
    });
    return res.cart;
  },
};

export const orderApi = {
  createOrder: async (shippingInfo: any): Promise<Order> => {
    const res = await fetchApi<{ success: boolean; order: Order }>("/orders", {
      method: "POST",
      body: JSON.stringify({ shippingInfo }),
    });
    return res.order;
  },
  getOrderById: async (orderId: string | number): Promise<Order> => {
    const res = await fetchApi<{ success: boolean; order: Order }>(`/orders/${orderId}`);
    return res.order;
  },
  getUserOrders: async (): Promise<Order[]> => {
    const res = await fetchApi<{ success: boolean; orders: Order[] }>("/orders");
    return res.orders || [];
  },
  getAllOrders: async (): Promise<Order[]> => {
    const res = await fetchApi<{ success: boolean; orders: Order[] }>("/orders/admin/all");
    return res.orders || [];
  },
  updateOrderStatus: async (orderId: number, status: string): Promise<void> => {
    await fetchApi(`/orders/${orderId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  },
  getDashboardStats: async (): Promise<{
    totalProducts: number;
    totalOrders: number;
    totalUsers: number;
    totalRevenue: number;
    recentOrders: Array<{ id: number; customer: string; status: string; totalAmount: number; createdAt: string }>;
  }> => {
    const res = await fetchApi("/orders/admin/stats");
    return res.stats;
  },
};

export const adminProductApi = {
  createProduct: async (productData: any) => {
    const res = await fetchApi("/products", {
      method: "POST",
      body: JSON.stringify(productData),
    });
    return res.product;
  },
  updateProduct: async (id: number, productData: any) => {
    const res = await fetchApi(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    });
    return res.product;
  },
  deleteProduct: async (id: number) => {
    await fetchApi(`/products/${id}`, {
      method: "DELETE",
    });
  },
};

export const authApi = {
  getMe: async (): Promise<{ id: number; name?: string; email: string; createdAt: string }> => {
    const res = await fetchApi<{ success: boolean; user: any }>("/auth/me");
    return res.user;
  },
  login: async (email: string, password: string): Promise<{ token: string; user: any }> => {
    const res = await fetchApi<{ success: boolean; token: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    return res;
  },
  register: async (name: string, email: string, password: string): Promise<{ message?: string; user?: any; token?: string }> => {
    const res = await fetchApi<{ success: boolean; message?: string; user?: any; token?: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    return res;
  },
};
