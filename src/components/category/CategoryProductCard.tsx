import Image from "next/image";
import Link from "next/link";

export default function ProductCard({ product }: any) {
  /* console.log("Renderizando ProductCard:", product); // 👀 para debug
   */
  return (
    <Link
      href={`/products/${product.slug}`} // ✅ ahora usa slug y la carpeta correcta
      className="block hover:shadow-md rounded-lg"
    >
      <div className="bg-white border rounded-lg shadow hover:shadow-lg p-4 flex flex-col relative">
        {product.discount && (
          <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded absolute top-2 left-2">
            {product.discount}
          </span>
        )}

        <div className="relative w-full aspect-square mb-3 overflow-hidden rounded-md">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        <h3 className="font-medium text-sm mb-2">{product.name}</h3>
        {product.brand && (
          <p className="text-gray-500 text-xs mb-2">{product.brand}</p>
        )}
        <p className="text-lg font-bold text-blue-600">${product.price}</p>
      </div>
    </Link>
  );
}
