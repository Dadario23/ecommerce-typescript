import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreHorizontal, Edit, Eye, Trash2, ArrowUpDown } from "lucide-react";
import { Product } from "@/types/product";
import { SortConfig } from "@/types/product";

// ✅ Helper para normalizar categorías
function getCategoryName(category: any): string {
  if (!category) return "Sin categoría";
  if (typeof category === "string") return category;
  if (typeof category === "object" && "name" in category) return category.name;
  return "Sin categoría";
}

interface ProductsTableViewProps {
  products: Product[];
  selectedProducts: string[];
  onSelectProduct: (ids: string[]) => void;
  onQuickEdit: (productId: string, field: keyof Product, value: any) => void;
  sortConfig: SortConfig;
  onSort: (config: SortConfig) => void;
  onEdit: (productId: string) => void;
  onDelete: (productId: string) => void;
}

export function ProductsTableView({
  products,
  selectedProducts,
  onSelectProduct,
  onQuickEdit,
  sortConfig,
  onSort,
  onEdit,
  onDelete,
}: ProductsTableViewProps) {
  const handleSort = (key: keyof Product) => {
    onSort({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc"
          ? "desc"
          : "asc",
    });
  };

  const handleSelectAll = (checked: boolean) => {
    onSelectProduct(checked ? products.map((p) => p._id) : []);
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    onSelectProduct(
      checked
        ? [...selectedProducts, productId]
        : selectedProducts.filter((id) => id !== productId)
    );
  };

  const SortableHeader = ({
    columnKey,
    children,
  }: {
    columnKey: keyof Product;
    children: React.ReactNode;
  }) => (
    <TableHead className="cursor-pointer" onClick={() => handleSort(columnKey)}>
      <div className="flex items-center">
        {children}
        <ArrowUpDown className="ml-2 h-4 w-4" />
        {sortConfig?.key === columnKey && (
          <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
        )}
      </div>
    </TableHead>
  );

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={
                  selectedProducts.length === products.length &&
                  products.length > 0
                }
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <SortableHeader columnKey="name">Producto</SortableHeader>
            <SortableHeader columnKey="sku">SKU</SortableHeader>
            <SortableHeader columnKey="stock">Stock</SortableHeader>
            <SortableHeader columnKey="price">Precio</SortableHeader>
            <SortableHeader columnKey="rating">Rating</SortableHeader>
            <SortableHeader columnKey="isActive">Estado</SortableHeader>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product._id}>
              <TableCell>
                <Checkbox
                  checked={selectedProducts.includes(product._id)}
                  onCheckedChange={(checked) =>
                    handleSelectProduct(product._id, checked as boolean)
                  }
                />
              </TableCell>
              <TableCell className="flex items-center gap-3">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-12 w-12 rounded object-cover"
                />
                <div className="flex flex-col">
                  <span
                    className="max-w-[160px] truncate text-sm font-medium"
                    title={product.name}
                  >
                    {product.name}
                  </span>
                  <p className="text-xs text-gray-500 break-words">
                    {getCategoryName(product.category)}
                  </p>
                </div>
              </TableCell>

              <TableCell>{product.sku || "-"}</TableCell>
              <TableCell>
                {product.stock !== undefined ? (
                  product.stock > 5 ? (
                    <Badge className="bg-green-100 text-green-700">
                      {product.stock} en stock
                    </Badge>
                  ) : product.stock > 0 ? (
                    <Badge className="bg-yellow-100 text-yellow-700">
                      Bajo ({product.stock})
                    </Badge>
                  ) : (
                    <Badge variant="destructive">Sin stock</Badge>
                  )
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-semibold">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.compareAtPrice && (
                    <span className="line-through text-gray-500 text-sm">
                      ${product.compareAtPrice.toFixed(2)}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex">
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
              </TableCell>
              <TableCell>
                {product.isActive ? (
                  <Badge className="bg-green-600">Publicado</Badge>
                ) : (
                  <Badge variant="secondary">Inactivo</Badge>
                )}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
