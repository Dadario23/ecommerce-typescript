import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ProductCard({ product }: { product: any }) {
  return (
    <Card>
      <CardContent className="p-4">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-40 object-cover"
        />
        <h3 className="mt-2 font-semibold">{product.name}</h3>
        <p className="text-sm text-gray-600">${product.price}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Link href={`/product/${product.slug}`}>
          <Button variant="secondary">Ver más</Button>
        </Link>
        <Button>Comprar</Button>
      </CardFooter>
    </Card>
  );
}
