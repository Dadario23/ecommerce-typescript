"use client";

import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";
import FiltersSidebar from "@/components/category/FiltersSidebar";
import ProductCard from "@/components/category/CategoryProductCard";
import ProductCardSkeleton from "@/components/category/ProductCardSkeleton";
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

function normalize(str: string) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export default function CategoryClient({ slug }: { slug: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 9;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error("Error al cargar productos:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const normalizedSlug = normalize(decodeURIComponent(slug));
  const filteredProducts = products.filter(
    (p) => normalize(p.category) === normalizedSlug
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const start = (page - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(start, start + itemsPerPage);

  return (
    <main className="pt-[140px] px-4 max-w-7xl mx-auto">
      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="w-64 hidden md:block">
          <FiltersSidebar />
        </aside>

        {/* Productos */}
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
                {decodeURIComponent(slug)}
              </span>
            </nav>
          </div>

          {/* Título */}
          <h1 className="text-2xl font-bold mb-6 capitalize">
            {decodeURIComponent(slug)}
          </h1>

          {/* Grid de productos */}
          {loading ? (
            // ✅ Skeletons mientras cargan los productos
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: itemsPerPage }).map((_, idx) => (
                <ProductCardSkeleton key={idx} />
              ))}
            </div>
          ) : paginatedProducts.length > 0 ? (
            // ✅ Productos cargados
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            // ✅ Si no hay productos
            <p>No hay productos disponibles en esta categoría.</p>
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
