// src/components/dashboard/products/ProductsFilters.tsx
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, X } from "lucide-react";

interface Filters {
  search: string;
  category: string;
  status: string;
  stock: string;
  minPrice: string;
  maxPrice: string;
  minRating: string;
}

interface ProductsFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  categories: string[];
  className?: string; // ✅ opcional
}

export function ProductsFilters({
  filters,
  onFiltersChange,
  categories,
}: ProductsFiltersProps) {
  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== "" && value !== "all" && value !== "0"
  );

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      category: "all",
      status: "all",
      stock: "all",
      minPrice: "",
      maxPrice: "",
      minRating: "0",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          <span className="text-sm font-medium">Filtros</span>
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          className="w-full"
          placeholder="Buscar por nombre o SKU..."
          value={filters.search}
          onChange={(e) =>
            onFiltersChange({ ...filters, search: e.target.value })
          }
        />

        <Select
          value={filters.category}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, category: value })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.status}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, status: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.stock}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, stock: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Stock" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo el stock</SelectItem>
            <SelectItem value="in-stock">Con stock</SelectItem>
            <SelectItem value="low-stock">Stock bajo</SelectItem>
            <SelectItem value="out-of-stock">Sin stock</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="number"
          placeholder="Precio mínimo"
          value={filters.minPrice}
          onChange={(e) =>
            onFiltersChange({ ...filters, minPrice: e.target.value })
          }
        />

        <Input
          type="number"
          placeholder="Precio máximo"
          value={filters.maxPrice}
          onChange={(e) =>
            onFiltersChange({ ...filters, maxPrice: e.target.value })
          }
        />

        <Select
          value={filters.minRating}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, minRating: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Rating mínimo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Cualquier rating</SelectItem>
            <SelectItem value="3">3+ estrellas</SelectItem>
            <SelectItem value="4">4+ estrellas</SelectItem>
            <SelectItem value="5">5 estrellas</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
