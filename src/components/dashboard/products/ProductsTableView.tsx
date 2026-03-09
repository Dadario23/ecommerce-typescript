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
import { Product, SortConfig } from "@/types/product";

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
        : selectedProducts.filter((id) => id !== productId),
    );
  };

  const SortableHeader = ({
    columnKey,
    children,
    className = "",
  }: {
    columnKey: keyof Product;
    children: React.ReactNode;
    className?: string;
  }) => (
    <TableHead
      className={`cursor-pointer select-none px-2 ${className}`}
      onClick={() => handleSort(columnKey)}
    >
      <div className="flex items-center">
        {children}
        <ArrowUpDown className="ml-2 h-4 w-4" />
        {sortConfig?.key === columnKey && (
          <span className="ml-1 text-xs">
            {sortConfig.direction === "asc" ? "↑" : "↓"}
          </span>
        )}
      </div>
    </TableHead>
  );

  return (
    <div className="rounded-md border">
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-10 px-2">
              <Checkbox
                checked={
                  selectedProducts.length === products.length &&
                  products.length > 0
                }
                onCheckedChange={handleSelectAll}
              />
            </TableHead>

            {/* Producto flexible */}
            <TableHead className="px-2">Producto</TableHead>

            <SortableHeader columnKey="sku" className="w-24">
              SKU
            </SortableHeader>

            <SortableHeader columnKey="stock" className="w-20">
              Stock
            </SortableHeader>

            <SortableHeader columnKey="price" className="w-28">
              Precio
            </SortableHeader>

            <SortableHeader columnKey="rating" className="w-24">
              Rating
            </SortableHeader>

            <SortableHeader columnKey="isActive" className="w-28">
              Estado
            </SortableHeader>

            <TableHead className="w-16 px-2">Acciones</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {products.map((product) => {
            const imageSrc = product.images?.[0];

            return (
              <TableRow key={product._id}>
                <TableCell className="px-2">
                  <Checkbox
                    checked={selectedProducts.includes(product._id)}
                    onCheckedChange={(checked) =>
                      handleSelectProduct(product._id, checked as boolean)
                    }
                  />
                </TableCell>

                {/* Producto */}
                <TableCell className="px-2">
                  <div className="flex items-center gap-3 min-w-0">
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={product.name}
                        className="h-10 w-10 rounded object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center text-xs text-gray-500 flex-shrink-0">
                        Sin img
                      </div>
                    )}

                    <div className="flex flex-col min-w-0">
                      <span
                        className="truncate text-sm font-medium"
                        title={product.name}
                      >
                        {product.name}
                      </span>
                      <span className="text-xs text-gray-500 truncate">
                        {getCategoryName(product.category)}
                      </span>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="px-2 truncate">
                  {product.sku || "-"}
                </TableCell>

                <TableCell className="px-2">
                  {product.stock !== undefined ? (
                    product.stock > 5 ? (
                      <Badge className="bg-green-100 text-green-700">
                        {product.stock}
                      </Badge>
                    ) : product.stock > 0 ? (
                      <Badge className="bg-yellow-100 text-yellow-700">
                        {product.stock}
                      </Badge>
                    ) : (
                      <Badge variant="destructive">0</Badge>
                    )
                  ) : (
                    "-"
                  )}
                </TableCell>

                <TableCell className="px-2">
                  <div className="flex flex-col">
                    <span className="font-semibold">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.compareAtPrice && (
                      <span className="line-through text-xs text-gray-500">
                        ${product.compareAtPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </TableCell>

                <TableCell className="px-2">
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

                <TableCell className="px-2">
                  {product.isActive ? (
                    <Badge className="bg-green-600">Publicado</Badge>
                  ) : (
                    <Badge variant="secondary">Inactivo</Badge>
                  )}
                </TableCell>

                <TableCell className="px-2">
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
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
