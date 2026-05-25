import { IProduct } from "@/models/Product";
import { Star } from "lucide-react";

export default function ProductInfo({ product }: { product: IProduct }) {
  const stock = product.stock ?? 0;
  const isInStock = stock > 0;
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;
  const savings = hasDiscount ? product.compareAtPrice! - product.price : 0;
  const installment = Math.ceil(product.price / 12);

  const avg = product.avgRating ?? 0;
  const reviewCount = product.reviewCount ?? 0;

  return (
    <div className="space-y-5">
      {/* Brand + stock */}
      <div className="flex items-center justify-between">
        {product.brand ? (
          <span className="text-xs font-semibold uppercase tracking-widest text-blue-600">
            {product.brand}
          </span>
        ) : <span />}
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            isInStock
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-600"
          }`}
        >
          {isInStock ? `${stock > 5 ? "En stock" : `Últimas ${stock} unidades`}` : "Sin stock"}
        </span>
      </div>

      {/* Name */}
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug">
        {product.name}
      </h1>

      {/* Rating */}
      {reviewCount > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(avg)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-200 fill-gray-200"
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-semibold text-gray-700">{avg.toFixed(1)}</span>
          <span className="text-sm text-gray-400">
            ({reviewCount} {reviewCount === 1 ? "reseña" : "reseñas"})
          </span>
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* Price block */}
      <div className="space-y-1">
        {hasDiscount && (
          <div className="flex items-center gap-2">
            <span className="text-base text-gray-400 line-through">
              ${product.compareAtPrice!.toLocaleString("es-AR")}
            </span>
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">
              {discountPct}% OFF
            </span>
          </div>
        )}

        <div className="flex items-end gap-3">
          <span className="text-4xl font-extrabold text-gray-900">
            ${product.price.toLocaleString("es-AR")}
          </span>
          {hasDiscount && (
            <span className="text-sm text-green-600 font-medium mb-1">
              Ahorrás ${savings.toLocaleString("es-AR")}
            </span>
          )}
        </div>

        <p className="text-sm text-blue-700 font-medium">
          12 cuotas sin interés de ${installment.toLocaleString("es-AR")}
        </p>

        {product.sku && (
          <p className="text-xs text-gray-400 pt-1">SKU: {product.sku}</p>
        )}
      </div>
    </div>
  );
}
