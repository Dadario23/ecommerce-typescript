import { Badge } from "@/components/ui/badge";
import { IProduct } from "@/models/Product";

interface ProductInfoProps {
  product: IProduct;
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const stock = product.stock ?? 0; // ✅ si viene undefined, usamos 0
  const isInStock = stock > 0;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
      <p className="text-lg text-gray-700 mb-2">${product.price}</p>
      <Badge variant={isInStock ? "default" : "destructive"}>
        {isInStock ? "En stock" : "Sin stock"}
      </Badge>
    </div>
  );
}
