import Image from "next/image";
import Link  from "next/link";

type productCardProps={
    id: number;
    name: string;
    price: number;
    image: string;
};

export default function ProductCart ({
     id,  name,price,image
}:productCardProps) {


    return(
        <div className="rounded-lg border p-4">

          <Link href={`/prodects/${id}`}>
          
          <div>
            <Image
        src={image}
        alt={name}
        width={400}
        height={300}
        className="h-48 w-full object-cover" 
         />
        
      <h2 className="text-xl font-bold">
        {name}
      </h2>

      <p className="mt-2 text-gray-600">
        ${price}
      </p>
          </div>
          </Link>
        

      <button className="mt-4 rounded bg-blue-500 px-4 py-2 text-white">
        Add to Cart
      </button>
    </div>
    );
}