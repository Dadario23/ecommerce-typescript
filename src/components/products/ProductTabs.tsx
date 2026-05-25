"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IProduct } from "@/models/Product";
import ReviewsSection from "./ReviewsSection";

interface ProductTabsProps {
  product: IProduct;
}

export default function ProductTabs({ product }: ProductTabsProps) {
  const productId = String(product._id);
  const avg = product.avgRating ?? 0;
  const count = product.reviewCount ?? 0;

  return (
    <div className="mt-8">
      <Tabs defaultValue="description" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="description">Descripción</TabsTrigger>
          <TabsTrigger value="reviews">
            Reseñas{count > 0 ? ` (${count})` : ""}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="mt-4">
          <div className="prose max-w-none text-gray-700 leading-relaxed">
            {product.description ? (
              <p>{product.description}</p>
            ) : (
              <p className="text-gray-400">No hay descripción disponible.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="mt-4">
          <ReviewsSection productId={productId} initialAvg={avg} initialCount={count} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
