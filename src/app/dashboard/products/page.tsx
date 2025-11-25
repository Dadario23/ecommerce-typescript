// src/app/dashboard/products/page.tsx
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Download, Upload, Grid, List } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useToast } from "@/hooks/use-toast";
import { ProductsLoading } from "@/components/dashboard/products/ProductsLoading";
import { ProductsStats } from "@/components/dashboard/products/ProductsStats";
import { ProductsFilters } from "@/components/dashboard/products/ProductsFilters";
import { ProductsBulkActions } from "@/components/dashboard/products/ProductsBulkActions";
import { ProductsTableView } from "@/components/dashboard/products/ProductsTableView";
import { ProductsGridView } from "@/components/dashboard/products/ProductsGridView";
import { ProductsPagination } from "@/components/dashboard/products/ProductsPagination";
import { ConfirmModal } from "@/components/dashboard/shared/ConfirmModal";
import { Product } from "@/types/product";

// ✅ Helper para normalizar categorías
function getCategoryName(category: any): string {
  if (!category) return "Sin categoría";
  if (typeof category === "string") return category;
  if (typeof category === "object" && "name" in category) return category.name;
  return "Sin categoría";
}

// Hook para detectar mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return isMobile;
}

interface SortConfig {
  key: keyof Product;
  direction: "asc" | "desc";
}

interface Filters {
  search: string;
  category: string;
  status: string;
  stock: string;
  minPrice: string;
  maxPrice: string;
  minRating: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "name",
    direction: "asc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [filters, setFilters] = useState<Filters>({
    search: "",
    category: "all",
    status: "all",
    stock: "all",
    minPrice: "",
    maxPrice: "",
    minRating: "0",
  });

  const debouncedSearch = useDebounce(filters.search, 300);

  // ✅ categorías deducidas de los productos (usando getCategoryName)
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(products.map((p) => getCategoryName(p.category)))
    );
    return ["all", ...uniqueCategories];
  }, [products]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Error al cargar productos");
      const data: Product[] = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // reset página cuando cambian filtros / búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [
    debouncedSearch,
    filters.category,
    filters.status,
    filters.stock,
    filters.minPrice,
    filters.maxPrice,
    filters.minRating,
  ]);

  // ajustar currentPage si itemsPerPage cambia
  useEffect(() => {
    setCurrentPage((prev) =>
      Math.min(prev, Math.max(1, Math.ceil(products.length / itemsPerPage)))
    );
  }, [itemsPerPage, products.length]);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const matchesSearch =
        debouncedSearch === "" ||
        product.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        product.sku?.toLowerCase().includes(debouncedSearch.toLowerCase());

      const matchesCategory =
        filters.category === "all" ||
        getCategoryName(product.category) === filters.category;

      const matchesStatus =
        filters.status === "all" ||
        (filters.status === "active" ? product.isActive : !product.isActive);

      const matchesStock =
        filters.stock === "all" ||
        (filters.stock === "in-stock" && (product.stock ?? 0) > 5) ||
        (filters.stock === "low-stock" &&
          (product.stock ?? 0) > 0 &&
          (product.stock ?? 0) <= 5) ||
        (filters.stock === "out-of-stock" && (product.stock ?? 0) === 0);

      const matchesPrice =
        (!filters.minPrice || product.price >= Number(filters.minPrice)) &&
        (!filters.maxPrice || product.price <= Number(filters.maxPrice));

      const matchesRating =
        !filters.minRating ||
        (product.rating ?? 0) >= Number(filters.minRating);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus &&
        matchesStock &&
        matchesPrice &&
        matchesRating
      );
    });

    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === undefined || bValue === undefined) return 0;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.direction === "asc"
          ? aValue - bValue
          : bValue - aValue;
      }

      return 0;
    });

    return filtered;
  }, [products, debouncedSearch, filters, sortConfig]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAndSortedProducts.length / itemsPerPage)
  );
  const paginatedProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = useMemo(
    () => ({
      total: products.length,
      active: products.filter((p) => p.isActive).length,
      outOfStock: products.filter((p) => (p.stock || 0) === 0).length,
      lowStock: products.filter(
        (p) => (p.stock || 0) > 0 && (p.stock || 0) <= 5
      ).length,
    }),
    [products]
  );

  const handleBulkAction = async (
    action: "delete" | "activate" | "deactivate"
  ) => {
    if (selectedProducts.length === 0) return;
    try {
      const response = await fetch("/api/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedProducts, action }),
      });
      if (response.ok) {
        toast({ title: "Éxito", description: "Acción completada" });
        setSelectedProducts([]);
        fetchProducts();
      } else {
        throw new Error("bulk failed");
      }
    } catch {
      toast({
        title: "Error",
        description: "Error en la acción",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (productId: string) => {
    window.location.href = `/dashboard/products/${productId}/edit`;
  };

  const handleDelete = (productId: string) => {
    setProductToDelete(productId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      const response = await fetch(`/api/products/${productToDelete}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast({ title: "Éxito", description: "Producto eliminado" });
        const remaining = filteredAndSortedProducts.length - 1;
        const newTotalPages = Math.max(1, Math.ceil(remaining / itemsPerPage));
        if (currentPage > newTotalPages) setCurrentPage(newTotalPages);
        fetchProducts();
      } else {
        throw new Error("delete failed");
      }
    } catch {
      toast({
        title: "Error",
        description: "Error al eliminar",
        variant: "destructive",
      });
    } finally {
      setDeleteModalOpen(false);
      setProductToDelete(null);
    }
  };

  const handleQuickEdit = async (
    productId: string,
    field: keyof Product,
    value: any
  ) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (response.ok) {
        toast({ title: "Éxito", description: "Producto actualizado" });
        fetchProducts();
      } else {
        throw new Error("patch failed");
      }
    } catch {
      toast({
        title: "Error",
        description: "Error al actualizar",
        variant: "destructive",
      });
    }
  };

  const exportToCSV = () => {
    const headers = ["Nombre", "SKU", "Precio", "Stock", "Categoría", "Estado"];
    const csvContent = [
      headers.join(","),
      ...filteredAndSortedProducts.map(
        (p) =>
          `"${p.name}","${p.sku || ""}",${p.price},${
            p.stock || 0
          },"${getCategoryName(p.category)}","${
            p.isActive ? "Activo" : "Inactivo"
          }"`
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "productos.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) return <ProductsLoading />;

  return (
    <main className="p-4 md:p-8 space-y-6">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <span>Dashboard</span>
        <span>›</span>
        <span className="text-foreground">Productos</span>
      </div>

      <ProductsStats {...stats} />

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
            <CardTitle>
              Gestión de Productos ({filteredAndSortedProducts.length})
            </CardTitle>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" /> Exportar
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" /> Importar
              </Button>
              <Button asChild size="sm">
                <a href="/dashboard/products/new">
                  <Plus className="h-4 w-4 mr-2" /> Nuevo Producto
                </a>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <ProductsFilters
            className="w-full"
            filters={filters}
            onFiltersChange={(next) => {
              setFilters(next);
            }}
            categories={categories}
          />

          <ProductsBulkActions
            selectedCount={selectedProducts.length}
            onActivate={() => handleBulkAction("activate")}
            onDeactivate={() => handleBulkAction("deactivate")}
            onDelete={() => handleBulkAction("delete")}
          />

          {!isMobile && (
            <div className="flex justify-end mb-4">
              <div className="flex border rounded-md overflow-hidden">
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className="rounded-r-none"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-l-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {isMobile || viewMode === "grid" ? (
            <ProductsGridView
              products={paginatedProducts}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : (
            <ProductsTableView
              products={paginatedProducts}
              selectedProducts={selectedProducts}
              onSelectProduct={(ids) => setSelectedProducts(ids)}
              onQuickEdit={handleQuickEdit}
              sortConfig={sortConfig}
              onSort={(cfg) => setSortConfig(cfg)}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}

          <ProductsPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(p) => setCurrentPage(p)}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={(n) => setItemsPerPage(n)}
            totalItems={filteredAndSortedProducts.length}
          />
        </CardContent>
      </Card>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Eliminar Producto"
        description="¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        variant="destructive"
      />
    </main>
  );
}
