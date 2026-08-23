import ProductCard from "../../components/ProductCard";
import { products } from "../data/products";

export default function Products() {
  return (
    <main className="p-8">
      <h1 className="mb-6 text-3xl font-bold">
        Products
      </h1>

      <div className="grid gap-6 md:grid-cols-3">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            price={product.price}
            image={product.image}
          />
        ))}
      </div>
    </main>
  );
}