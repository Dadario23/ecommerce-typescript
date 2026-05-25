import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Product, SortConfig } from "@/types/product";

function getCategoryName(category: unknown): string {
  if (!category) return "Sin categoría";
  if (typeof category === "string") return category;
  if (typeof category === "object" && category !== null && "name" in category)
    return (category as { name: string }).name;
  return "Sin categoría";
}

interface ProductsTableViewProps {
  products: Product[];
  selectedProducts: string[];
  onSelectProduct: (ids: string[]) => void;
  onQuickEdit: (productId: string, field: keyof Product, value: unknown) => void;
  sortConfig: SortConfig;
  onSort: (config: SortConfig) => void;
  onEdit: (productId: string) => void;
  onDelete: (productId: string) => void;
}

export function ProductsTableView({
  products, selectedProducts, onSelectProduct,
  sortConfig, onSort, onEdit, onDelete,
}: ProductsTableViewProps) {
  const handleSort = (key: keyof Product) => {
    onSort({
      key,
      direction: sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc",
    });
  };

  const SortIcon = ({ column }: { column: keyof Product }) => {
    if (sortConfig.key !== column)
      return <ArrowUpDown className="w-3 h-3 text-gray-300 ml-1 shrink-0" />;
    return sortConfig.direction === "asc"
      ? <ArrowUp className="w-3 h-3 text-[#1E3A8A] ml-1 shrink-0" />
      : <ArrowDown className="w-3 h-3 text-[#1E3A8A] ml-1 shrink-0" />;
  };

  const allSelected = products.length > 0 && selectedProducts.length === products.length;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/50">
            <th className="w-10 px-5 py-3 text-left">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(checked) =>
                  onSelectProduct(checked ? products.map((p) => p._id) : [])
                }
              />
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Producto
            </th>
            <th
              className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600 select-none whitespace-nowrap"
              onClick={() => handleSort("stock")}
            >
              <span className="inline-flex items-center">
                Stock <SortIcon column="stock" />
              </span>
            </th>
            <th
              className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600 select-none whitespace-nowrap"
              onClick={() => handleSort("price")}
            >
              <span className="inline-flex items-center">
                Precio <SortIcon column="price" />
              </span>
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Estado
            </th>
            <th className="w-20 px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {products.map((product) => {
            const imageSrc = product.images?.[0];
            const stockQty = product.stock ?? 0;
            const stockPill =
              stockQty > 5
                ? "bg-green-100 text-green-700"
                : stockQty > 0
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-600";

            return (
              <tr key={product._id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-5 py-3">
                  <Checkbox
                    checked={selectedProducts.includes(product._id)}
                    onCheckedChange={(checked) =>
                      onSelectProduct(
                        checked
                          ? [...selectedProducts, product._id]
                          : selectedProducts.filter((id) => id !== product._id)
                      )
                    }
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-10 h-10 rounded-lg border border-gray-100 bg-gray-50 shrink-0 overflow-hidden">
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt={product.name}
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-300">
                          N/A
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p
                        className="text-sm font-semibold text-gray-800 truncate max-w-48"
                        title={product.name}
                      >
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {product.sku
                          ? `SKU: ${product.sku}`
                          : getCategoryName(product.category)}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${stockPill}`}>
                    {stockQty}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-gray-900">
                    ${product.price.toLocaleString("es-AR")}
                  </p>
                  {product.compareAtPrice && (
                    <p className="line-through text-xs text-gray-400">
                      ${product.compareAtPrice.toLocaleString("es-AR")}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                    product.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}>
                    {product.isActive ? "Publicado" : "Inactivo"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(product._id)}
                      className="p-1.5 text-gray-400 hover:text-[#1E3A8A] hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(product._id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
