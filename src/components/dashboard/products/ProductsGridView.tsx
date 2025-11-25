import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Eye, Trash2 } from "lucide-react";
import { Product } from "@/types/product";

// ✅ Helper para normalizar categorías
function getCategoryName(category: any): string {
  if (!category) return "Sin categoría";
  if (typeof category === "string") return category;
  if (typeof category === "object" && "name" in category) return category.name;
  return "Sin categoría";
}

interface ProductsGridViewProps {
  products: Product[];
  onEdit: (productId: string) => void;
  onDelete: (productId: string) => void;
}

export function ProductsGridView({
  products,
  onEdit,
  onDelete,
}: ProductsGridViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => (
        <Card key={product._id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-16 w-16 rounded object-cover"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(product._id)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(product._id)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Ver
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => onDelete(product._id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-sm line-clamp-2">
                {product.name}
              </h3>
              <p className="text-xs text-gray-500">
                {getCategoryName(product.category)}
              </p>

              <div className="flex flex-wrap gap-1">
                {product.sku && (
                  <Badge variant="outline" className="text-xs">
                    SKU: {product.sku}
                  </Badge>
                )}
                {product.stock !== undefined && (
                  <Badge
                    variant={
                      product.stock === 0
                        ? "destructive"
                        : product.stock <= 5
                        ? "secondary"
                        : "default"
                    }
                    className="text-xs"
                  >
                    {product.stock} en stock
                  </Badge>
                )}
                <Badge
                  variant={product.isActive ? "default" : "secondary"}
                  className="text-xs"
                >
                  {product.isActive ? "Activo" : "Inactivo"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold">
                  ${product.price.toFixed(2)}
                </span>
                <div className="flex text-yellow-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={
                        i < (product.rating || 0)
                          ? "text-yellow-500"
                          : "text-gray-300"
                      }
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
