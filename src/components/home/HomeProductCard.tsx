import Image from "next/image";
import Link from "next/link";

interface HomeProductCardProps {
  slug: string;
  image: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  brand?: string;
}

export default function HomeProductCard({
  slug,
  image,
  name,
  price,
  compareAtPrice,
  brand,
}: HomeProductCardProps) {
  const hasDiscount = compareAtPrice && compareAtPrice > price;
  const discountPct = hasDiscount
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;
  const installment = Math.ceil(price / 12);

  return (
    <Link
      href={`/products/${slug}`}
      className="group bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden"
    >
      {/* Image */}
      <div className="relative w-full aspect-square bg-gray-50 overflow-hidden">
        {hasDiscount && (
          <span className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            -{discountPct}%
          </span>
        )}
        <Image
          src={image || "/placeholder-category.jpg"}
          alt={name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        {brand && (
          <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-600">
            {brand}
          </p>
        )}
        <h3 className="text-xs font-medium text-gray-800 line-clamp-2 leading-snug flex-1">
          {name}
        </h3>

        <div className="mt-1">
          {hasDiscount && (
            <p className="text-[10px] text-gray-400 line-through">
              ${compareAtPrice.toLocaleString("es-AR")}
            </p>
          )}
          <p className="text-base font-bold text-gray-900">
            ${price.toLocaleString("es-AR")}
          </p>
          <p className="text-[10px] text-blue-700 font-medium">
            12x ${installment.toLocaleString("es-AR")}
          </p>
        </div>
      </div>
    </Link>
  );
}
