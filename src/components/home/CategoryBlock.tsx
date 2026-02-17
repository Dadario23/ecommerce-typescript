import Image from "next/image";
import ProductCard from "./HomeProductCard";

interface Product {
  image: string;
  title: string;
  price: string;
  installment10: string;
  installment12: string;
}

interface CategoryBlockProps {
  bannerImage: string;
  bannerTitle: string;
  products: Product[];
  catalogLink: string;
}

export default function CategoryBlock({
  bannerImage,
  bannerTitle,
  products,
  catalogLink,
}: CategoryBlockProps) {
  return (
    <div className="flex flex-col bg-gray-50 rounded-lg overflow-hidden shadow-md">
      {/* Banner */}
      <div className="relative w-full h-40 sm:h-48 md:h-56 lg:h-64 bg-gray-200">
        <Image
          src={bannerImage}
          alt={bannerTitle}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover"
        />
        <div className="absolute bottom-2 left-2 bg-blue-900 text-white px-3 py-1 rounded-md font-semibold text-sm sm:text-base">
          {bannerTitle}
        </div>
      </div>

      {/* Lista de productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
        {products.map((p, i) => (
          <ProductCard key={i} {...p} />
        ))}
      </div>
    </div>
  );
}
