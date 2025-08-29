import { IProduct } from "@/models/Product";
import { Badge } from "@/components/ui/badge";

interface ProductInfoProps {
  product: IProduct;
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const stock = product.stock ?? 0;
  const isInStock = stock > 0;
  const hasDiscount =
    product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(
        ((product.compareAtPrice! - product.price) / product.compareAtPrice!) *
          100
      )
    : 0;

  return (
    <div className="space-y-4">
      {/* Marca */}
      {product.brand && (
        <p className="text-sm font-medium text-gray-500">{product.brand}</p>
      )}

      {/* Nombre del producto */}
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
        {product.name}
      </h1>

      {/* Precios */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold text-gray-900">
            ${product.price.toLocaleString("es-AR")}
          </span>
          {hasDiscount && (
            <Badge variant="destructive" className="text-sm">
              {discountPercentage}% OFF
            </Badge>
          )}
        </div>

        {hasDiscount && (
          <div className="flex items-center gap-2">
            <span className="text-lg text-gray-500 line-through">
              ${product.compareAtPrice!.toLocaleString("es-AR")}
            </span>
            <span className="text-sm text-green-600">
              Ahorras $
              {(product.compareAtPrice! - product.price).toLocaleString(
                "es-AR"
              )}
            </span>
          </div>
        )}

        <p className="text-sm text-gray-500">
          Precios sin impuestos nacionales: $
          {(product.price / 1.21).toLocaleString("es-AR", {
            maximumFractionDigits: 2,
          })}
        </p>
      </div>

      {/* Estado de stock */}
      <div className="flex items-center gap-2">
        <Badge
          variant={isInStock ? "default" : "destructive"}
          className="text-sm"
        >
          {isInStock ? "En stock" : "Sin stock"}
        </Badge>
        {!isInStock && (
          <p className="text-sm text-gray-500">
            Este producto puede encontrarse sin stock
          </p>
        )}
      </div>

      {/* SKU */}
      {product.sku && (
        <div className="text-sm text-gray-500">SKU: {product.sku}</div>
      )}
    </div>
  );
}
