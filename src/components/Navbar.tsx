"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ShoppingCart, User, LogOut, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NavbarSearch from "./NavbarSearch";
import { useSession, signOut } from "next-auth/react";
import { useCartWithSession } from "@/hooks/useCartWithSession";
import { useCartUI } from "@/store/useCartUI";
import { useCartStore } from "@/store/useCartStore";

interface Category {
  _id: string;
  name: string;
  slug?: string;
}

export default function Navbar() {
  const router = useRouter();
  const sp = useSearchParams();
  const { data: session, status } = useSession();

  const { isLoading } = useCartWithSession();
  const itemsCount = useCartStore((state) =>
    state.items.reduce((acc, item) => acc + item.quantity, 0)
  );
  const { toggle } = useCartUI();

  const [q, setQ] = useState(sp.get("q") || "");
  const [results, setResults] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Cargar categorías dinámicas
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories/public");
        const data = await res.json();
        setCategories(data.categories || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setCategoriesLoading(false);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => setQ(sp.get("q") || ""), [sp]);

  useEffect(() => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    const delay = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products/search?query=${q}`);
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error("Error buscando productos:", err);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [q]);

  const onCategoryClick = (category: Category) => {
    const slug =
      category.slug ||
      category.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[\s-]+/g, "-")
        .replace(/^-+|-+$/g, "");
    router.push(`/category/${slug}`);
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 relative">
        <Link href="/" className="flex items-center gap-2">
          <img
            src="https://www.perozzi.com.ar/img/logo_perozzi.png"
            alt="Logo"
            className="h-9"
          />
        </Link>

        <NavbarSearch />

        <div className="flex items-center gap-4 text-sm text-gray-700">
          {status === "loading" ? (
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <span className="hidden sm:inline">Cargando...</span>
            </div>
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                  <User className="w-5 h-5" />
                  <span className="hidden sm:inline">
                    Hola, {session.user?.name || "Usuario"}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/account/orders">
                    Historial de pedidos y detalles
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account/addresses">Direcciones</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account/change-password">
                    Cambio de contraseña
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="cursor-pointer text-red-600 focus:text-red-700"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1 hover:text-blue-600 transition-colors"
            >
              <User className="w-5 h-5" />
              <span className="hidden sm:inline">Iniciar sesión</span>
            </Link>
          )}

          <button
            onClick={toggle}
            disabled={isLoading}
            className={`flex items-center gap-1 hover:text-blue-600 transition-colors ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="hidden sm:inline">Carrito</span>
            {!isLoading && itemsCount > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {itemsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <nav className="flex flex-wrap md:flex-nowrap md:overflow-x-auto overflow-x-hidden px-4 bg-gray-50 text-sm shadow-sm scrollbar-hide">
        {/* "Ofertas del Mes" siempre visible */}
        <button
          onClick={() => router.push("/category/ofertas-del-mes")}
          className="px-4 py-2 whitespace-nowrap text-red-600 font-semibold hover:bg-gray-100 transition-colors rounded"
        >
          Ofertas del Mes
        </button>

        {/* Categorías dinámicas desde la base de datos */}
        {categoriesLoading
          ? // Skeletons mientras cargan las categorías
            [...Array(6)].map((_, i) => (
              <div
                key={i}
                className="px-4 py-2 whitespace-nowrap text-gray-400 animate-pulse"
              >
                <div className="h-4 bg-gray-300 rounded w-16"></div>
              </div>
            ))
          : categories.map((category) => (
              <button
                key={category._id}
                onClick={() => onCategoryClick(category)}
                className="px-4 py-2 whitespace-nowrap text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors rounded"
              >
                {category.name}
              </button>
            ))}
      </nav>
    </header>
  );
}
