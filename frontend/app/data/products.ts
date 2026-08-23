export type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
};

export const products: Product[] = [
  {
    id: 1,
    name: "iPhone 17",
    price: 999,
    image: "/iphone.jpg",
  },
  {
    id: 2,
    name: "Samsung S26",
    price: 899,
    image: "/samsung.jpg",
  },
  {
    id: 3,
    name: "MacBook Air",
    price: 1099,
    image: "/macbook.jpg",
  },
];