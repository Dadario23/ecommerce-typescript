import Link from "next/link";

export default function ProductCard({ product }: any) {
  console.log("Renderizando ProductCard:", product); // 👀 para debug

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

        <img
          src={product.imageUrl} // ✅ corregido a imageUrl
          alt={product.name}
          className="w-full h-40 object-contain mb-4"
        />

        <h3 className="font-medium text-sm mb-2">{product.name}</h3>
        {product.brand && (
          <p className="text-gray-500 text-xs mb-2">{product.brand}</p>
        )}
        <p className="text-lg font-bold text-blue-600">${product.price}</p>
      </div>
    </Link>
  );
}
