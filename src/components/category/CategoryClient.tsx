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
  category: any;
}

function getCategoryName(category: any): string {
  if (!category) return "Sin categoría";
  if (typeof category === "string") return category;
  if (typeof category === "object" && "name" in category) return category.name;
  return "Sin categoría";
}

function normalize(str: string) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

// Mapeo de slugs a palabras clave en los nombres de productos
const CATEGORY_KEYWORDS: { [key: string]: string[] } = {
  celulares: ["celular", "moto", "galaxy", "smartphone", "mobile", "iphone"],
  televisores: ["tv", "televisor", "smart tv", "pantalla"],
  gaming: ["gamer", "gaming", "game", "victus", "zowie"],
  computacion: ["notebook", "laptop", "monitor", "pc", "computadora"],
  audio: ["auricular", "parlante", "audio", "sonido", "headphone"],
  hogar: ["electrodoméstico", "hogar", "cocina", "lavarropas"],
};

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
        console.log("📦 Productos cargados:", data.length);
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

  // ✅ FILTRADO POR NOMBRE - solución inmediata
  const filteredProducts = products.filter((product) => {
    const productName = normalize(product.name);
    const productCategory = normalize(getCategoryName(product.category));

    // 1. Primero buscar por categoría asignada
    if (productCategory === normalizedSlug) {
      return true;
    }

    // 2. Si no tiene categoría, buscar por palabras clave en el nombre
    const keywords = CATEGORY_KEYWORDS[normalizedSlug] || [normalizedSlug];
    const matchesByName = keywords.some((keyword) =>
      productName.includes(normalize(keyword))
    );

    if (matchesByName) {
      console.log("✅ Producto encontrado por nombre:", {
        nombre: product.name,
        categoriaAsignada: getCategoryName(product.category),
        keyword: keywords.find((k) => productName.includes(normalize(k))),
      });
      return true;
    }

    return false;
  });

  console.log("🔍 Debug Filtrado:", {
    slugBuscado: normalizedSlug,
    totalProductos: products.length,
    productosFiltrados: filteredProducts.length,
    palabrasClave: CATEGORY_KEYWORDS[normalizedSlug] || [normalizedSlug],
    productosEncontrados: filteredProducts.map((p) => ({
      name: p.name,
      category: getCategoryName(p.category),
      price: p.price,
    })),
  });

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

          {/* Información de debug */}
          {process.env.NODE_ENV === "development" && (
            <div className="mb-4 p-3 bg-blue-50 rounded text-sm">
              <strong>Debug:</strong> {filteredProducts.length} productos de{" "}
              {products.length} totales
              <br />
              <strong>Palabras clave usadas:</strong>{" "}
              {CATEGORY_KEYWORDS[normalizedSlug]?.join(", ") || normalizedSlug}
            </div>
          )}

          {/* Grid de productos */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: itemsPerPage }).map((_, idx) => (
                <ProductCardSkeleton key={idx} />
              ))}
            </div>
          ) : paginatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                No hay productos disponibles en esta categoría.
              </p>
              <div className="text-sm text-gray-400 space-y-1">
                <p>Categoría: "{decodeURIComponent(slug)}"</p>
                <p>Total productos: {products.length}</p>
                <p>
                  Con categoría asignada:{" "}
                  {
                    products.filter(
                      (p) => getCategoryName(p.category) !== "Sin categoría"
                    ).length
                  }
                </p>
              </div>
            </div>
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
