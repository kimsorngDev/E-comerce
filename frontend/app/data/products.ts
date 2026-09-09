export interface ProductSpec {
  brand: string;
  model: string;
  storage?: string;
  color: string;
  condition: string;
  [key: string]: string | undefined;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  stock: number;
  brand: string;
  categoryId: number;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  imageUrl: string;
  galleryImages: string[];
  specs: ProductSpec;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNew?: boolean;
}

export const CATEGORIES = [
  { id: 1, name: "Electronics", slug: "electronics", icon: "bi-laptop", image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=400&q=80" },
  { id: 2, name: "Fashion", slug: "fashion", icon: "bi-bag", image: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=400&q=80" },
  { id: 3, name: "Home & Living", slug: "home-living", icon: "bi-house", image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80" },
  { id: 4, name: "Beauty", slug: "beauty", icon: "bi-flower1", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=400&q=80" },
  { id: 5, name: "Sports", slug: "sports", icon: "bi-dribbble", image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=400&q=80" },
];

export const BRANDS = ["Apple", "Samsung", "Sony", "Nike", "Adidas"];

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "iPhone 15",
    description: "The iPhone 15 features a 6.1-inch Super Retina XDR display, A16 Bionic chip, and an advanced dual-camera system. Experience faster performance, better battery life, and stunning photos and videos.",
    price: 799.0,
    originalPrice: 899.0,
    rating: 4.8,
    reviewsCount: 320,
    stock: 45,
    brand: "Apple",
    categoryId: 1,
    category: { id: 1, name: "Electronics", slug: "electronics" },
    imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
    ],
    specs: {
      brand: "Apple",
      model: "iPhone 15",
      storage: "128GB",
      color: "Black",
      condition: "New",
    },
    isFeatured: true,
    isBestSeller: true,
  },
  {
    id: 2,
    name: "MacBook Air",
    description: "Incredibly thin and fast MacBook Air with Apple M2 chip. Up to 18 hours of battery life and a stunning 13.6-inch Liquid Retina display.",
    price: 999.0,
    originalPrice: 1199.0,
    rating: 4.7,
    reviewsCount: 215,
    stock: 28,
    brand: "Apple",
    categoryId: 1,
    category: { id: 1, name: "Electronics", slug: "electronics" },
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80",
    ],
    specs: {
      brand: "Apple",
      model: "MacBook Air M2",
      storage: "256GB SSD",
      color: "Space Gray",
      condition: "New",
    },
    isFeatured: true,
  },
  {
    id: 3,
    name: "Samsung Galaxy Buds",
    description: "Premium wireless earbuds with active noise cancellation, studio-quality sound by AKG, and long-lasting battery life.",
    price: 149.0,
    originalPrice: 199.0,
    rating: 4.5,
    reviewsCount: 189,
    stock: 62,
    brand: "Samsung",
    categoryId: 1,
    category: { id: 1, name: "Electronics", slug: "electronics" },
    imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
    ],
    specs: {
      brand: "Samsung",
      model: "Galaxy Buds2 Pro",
      storage: "N/A",
      color: "White",
      condition: "New",
    },
  },
  {
    id: 4,
    name: "AirPods Pro",
    description: "Next-level active noise cancellation, Adaptive Transparency, and Personalized Spatial Audio with dynamic head tracking.",
    price: 249.0,
    originalPrice: 299.0,
    rating: 4.6,
    reviewsCount: 167,
    stock: 50,
    brand: "Apple",
    categoryId: 1,
    category: { id: 1, name: "Electronics", slug: "electronics" },
    imageUrl: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80",
    ],
    specs: {
      brand: "Apple",
      model: "AirPods Pro (2nd Gen)",
      storage: "N/A",
      color: "White",
      condition: "New",
    },
    isBestSeller: true,
  },
  {
    id: 5,
    name: "Smart Watch",
    description: "Track your health and workouts with advanced sensors, crisp OLED display, heart rate monitor, sleep tracking, and water resistance.",
    price: 99.0,
    originalPrice: 129.0,
    rating: 4.5,
    reviewsCount: 120,
    stock: 35,
    brand: "Sony",
    categoryId: 1,
    category: { id: 1, name: "Electronics", slug: "electronics" },
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80",
    ],
    specs: {
      brand: "Sony",
      model: "Smart Band V4",
      storage: "32GB",
      color: "Midnight Black",
      condition: "New",
    },
    isFeatured: true,
  },
  {
    id: 6,
    name: "Running Shoes",
    description: "Engineered mesh upper for breathable comfort with responsive foam cushioning for everyday runs and active lifestyles.",
    price: 59.0,
    originalPrice: 85.0,
    rating: 4.3,
    reviewsCount: 89,
    stock: 40,
    brand: "Nike",
    categoryId: 5,
    category: { id: 5, name: "Sports", slug: "sports" },
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    ],
    specs: {
      brand: "Nike",
      model: "Air Max Speed 3",
      storage: "N/A",
      color: "White / Coral",
      condition: "New",
    },
    isFeatured: true,
  },
  {
    id: 7,
    name: "Bluetooth Headphones",
    description: "High-fidelity audio with active noise cancellation and 40 hours of playtime on a single charge. Comfortable over-ear design.",
    price: 79.0,
    originalPrice: 119.0,
    rating: 4.6,
    reviewsCount: 142,
    stock: 22,
    brand: "Sony",
    categoryId: 1,
    category: { id: 1, name: "Electronics", slug: "electronics" },
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    ],
    specs: {
      brand: "Sony",
      model: "WH-500BT",
      storage: "N/A",
      color: "Matte Black",
      condition: "New",
    },
    isFeatured: true,
  },
  {
    id: 8,
    name: "Backpack",
    description: "Durable water-resistant backpack with padded laptop sleeve, multiple organizer pockets, and ergonomic shoulder straps.",
    price: 45.0,
    originalPrice: 65.0,
    rating: 4.2,
    reviewsCount: 78,
    stock: 55,
    brand: "Adidas",
    categoryId: 2,
    category: { id: 2, name: "Fashion", slug: "fashion" },
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    ],
    specs: {
      brand: "Adidas",
      model: "Urban Explorer 25L",
      storage: "25 Liters",
      color: "Charcoal Black",
      condition: "New",
    },
    isFeatured: true,
  },
  {
    id: 9,
    name: "T-shirt",
    description: "Classic crewneck cotton t-shirt. Ultra-soft breathable fabric tailored for all-day comfort and effortless modern styling.",
    price: 25.0,
    originalPrice: 35.0,
    rating: 4.1,
    reviewsCount: 54,
    stock: 120,
    brand: "Nike",
    categoryId: 2,
    category: { id: 2, name: "Fashion", slug: "fashion" },
    imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
    ],
    specs: {
      brand: "Nike",
      model: "Essential Tee",
      storage: "N/A",
      color: "Black",
      condition: "New",
    },
  },
  {
    id: 10,
    name: "Sunglasses",
    description: "Polarized UV400 protection sunglasses with lightweight durable frame and timeless classic design.",
    price: 35.0,
    originalPrice: 50.0,
    rating: 4.4,
    reviewsCount: 89,
    stock: 65,
    brand: "Sony",
    categoryId: 2,
    category: { id: 2, name: "Fashion", slug: "fashion" },
    imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
    ],
    specs: {
      brand: "Sony",
      model: "Polarized Vision Pro",
      storage: "N/A",
      color: "Dark Slate",
      condition: "New",
    },
  },
  {
    id: 11,
    name: "iPhone 14",
    description: "Impressive all-day battery life, emergency SOS via satellite, and stunning low-light photography capabilities.",
    price: 699.0,
    originalPrice: 799.0,
    rating: 4.6,
    reviewsCount: 210,
    stock: 18,
    brand: "Apple",
    categoryId: 1,
    category: { id: 1, name: "Electronics", slug: "electronics" },
    imageUrl: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80",
    ],
    specs: {
      brand: "Apple",
      model: "iPhone 14",
      storage: "128GB",
      color: "Blue",
      condition: "New",
    },
  },
  {
    id: 12,
    name: "Samsung Galaxy S23",
    description: "Capture epic moments with Nightography camera, Snapdragon 8 Gen 2 processor, and dynamic AMOLED 2X display.",
    price: 646.0,
    originalPrice: 749.0,
    rating: 4.5,
    reviewsCount: 180,
    stock: 25,
    brand: "Samsung",
    categoryId: 1,
    category: { id: 1, name: "Electronics", slug: "electronics" },
    imageUrl: "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80",
    ],
    specs: {
      brand: "Samsung",
      model: "Galaxy S23",
      storage: "256GB",
      color: "Phantom Black",
      condition: "New",
    },
  },
  {
    id: 13,
    name: "iPad Air",
    description: "Supercharged by Apple M1 chip with 10.9-inch Liquid Retina display, Touch ID, and all-day battery life.",
    price: 599.0,
    originalPrice: 699.0,
    rating: 4.4,
    reviewsCount: 132,
    stock: 30,
    brand: "Apple",
    categoryId: 1,
    category: { id: 1, name: "Electronics", slug: "electronics" },
    imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80",
    ],
    specs: {
      brand: "Apple",
      model: "iPad Air 5th Gen",
      storage: "64GB",
      color: "Space Gray",
      condition: "New",
    },
  },
  {
    id: 14,
    name: "Apple Watch SE",
    description: "Essential features to help you stay connected, active, healthy, and safe. Perfect workout and fitness companion.",
    price: 279.0,
    originalPrice: 329.0,
    rating: 4.3,
    reviewsCount: 95,
    stock: 42,
    brand: "Apple",
    categoryId: 1,
    category: { id: 1, name: "Electronics", slug: "electronics" },
    imageUrl: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80",
    ],
    specs: {
      brand: "Apple",
      model: "Watch SE (2nd Gen)",
      storage: "32GB",
      color: "Midnight",
      condition: "New",
    },
  },
];

// Helper to get product by ID
export function getProductById(id: number | string): Product | undefined {
  const numId = Number(id);
  return PRODUCTS.find((p) => p.id === numId) || PRODUCTS[0];
}

// Mock initial cart items for visual demo matching mockup
export const INITIAL_CART_ITEMS = [
  {
    id: 1,
    product: PRODUCTS[0], // iPhone 15 ($799)
    quantity: 1,
    color: "Black",
  },
  {
    id: 2,
    product: PRODUCTS[5], // Running Shoes ($59)
    quantity: 1,
    size: "42",
  },
  {
    id: 3,
    product: PRODUCTS[6], // Bluetooth Headphones ($79)
    quantity: 1,
    color: "Black",
  },
];