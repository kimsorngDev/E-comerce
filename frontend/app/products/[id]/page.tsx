import Image from "next/image";
import { products } from "@/app/data/products";

// export const products = [
//   {
//     id:1,
//     name: "iPhone 17",
//     price: 999,
//     image: "/iPhone 17 Pro, iPhone 17 Pro Max.jpg",
//   },
//   {
//     id:2,
//     name: "Samsung S26",
//     price: 899,
//     image: "/iPhone 17 Pro, iPhone 17 Pro Max.jpg",
//   },
//   {
//     id:3,
//     name: "MacBook Air",
//     price: 1099,
//     image: "/iPhone 17 Pro, iPhone 17 Pro Max.jpg",
//   },
// ];

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { id } = await params;

  const product = products.find(
    (product) => product.id === Number(id)
  );

  if (!product) {
    return <h1>Product not found</h1>;
  }

  return (
    <main className="p-8">
      <Image
        src={product.image}
        alt={product.name}
        width={500}
        height={400}
      />

      <h1 className="mt-4 text-3xl font-bold">
        {product.name}
      </h1>

      <p className="mt-2 text-xl">
        ${product.price}
      </p>

      <button className="mt-4 rounded bg-blue-500 px-4 py-2 text-white">
        Add to Cart
      </button>
    </main>
  );
}