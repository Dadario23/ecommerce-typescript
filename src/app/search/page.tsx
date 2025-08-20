"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";
import FiltersSidebar from "@/components/category/FiltersSidebar";
import ProductCard from "@/components/category/CategoryProductCard";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useEffect, useState } from "react";

interface Product {
  _id: string;
  slug: string;
  name: string;
  price: number;
  imageUrl?: string;
  category: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSearchResults() {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/products/search?query=${encodeURIComponent(query)}&mode=full`
        );

        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error("Error al buscar productos:", error);
      } finally {
        setLoading(false);
      }
    }

    if (query.trim().length > 0) {
      fetchSearchResults();
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [query]);

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const start = (page - 1) * itemsPerPage;
  const paginatedProducts = products.slice(start, start + itemsPerPage);

  return (
    <main className="pt-[140px] px-4 max-w-7xl mx-auto">
      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="w-64 hidden md:block">
          <FiltersSidebar />
        </aside>

        {/* Resultados */}
        <section className="flex-1">
          {/* Breadcrumb */}
          <div className="max-w-6xl mx-auto mb-6">
            <nav className="flex items-center text-sm text-gray-500">
              <Link href="/" className="hover:underline flex items-center">
                <Home className="w-4 h-4 mr-1" />
                Inicio
              </Link>
              <ChevronRight className="w-4 h-4 mx-2" />
              <span className="capitalize font-medium text-gray-800">
                Resultados de "{query}"
              </span>
            </nav>
          </div>

          {/* Título */}
          <h1 className="text-2xl font-bold mb-6">
            Resultados de búsqueda para:{" "}
            <span className="text-blue-600">{query}</span>
          </h1>

          {/* Grid de productos */}
          {loading ? (
            <p>Cargando productos...</p>
          ) : paginatedProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {paginatedProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">
              No se encontraron productos para "{query}".
            </p>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    />
                  </PaginationItem>

                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        href="#"
                        isActive={page === i + 1}
                        onClick={() => setPage(i + 1)}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
