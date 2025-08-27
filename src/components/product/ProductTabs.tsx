"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IProduct } from "@/models/Product";

interface ProductTabsProps {
  product: IProduct;
}

export default function ProductTabs({ product }: ProductTabsProps) {
  return (
    <div className="mt-8">
      <Tabs defaultValue="description" className="w-full">
        {/* Encabezado de pestañas */}
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="description">Descripción</TabsTrigger>
          <TabsTrigger value="reviews">Reseñas</TabsTrigger>
        </TabsList>

        {/* Contenido de la pestaña Descripción */}
        <TabsContent value="description">
          <div className="prose max-w-none">
            {product.description ? (
              <p>{product.description}</p>
            ) : (
              <p>No hay descripción disponible para este producto.</p>
            )}
          </div>
        </TabsContent>

        {/* Contenido de la pestaña Reseñas */}
        <TabsContent value="reviews">
          <div className="text-gray-500">
            <p>Aún no hay reseñas para este producto.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
