"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ShoppingCart, User } from "lucide-react";
import NavbarSearch from "./NavbarSearch";

const categories = [
  "Ofertas del Mes",
  "TV - Video - Foto",
  "Celulares",
  "Informática",
  "Gaming",
  "Audio",
  "Muebles",
  "Hogar",
  "Climatización",
  "Electrodomésticos",
  "Salud",
  "Infantiles",
  "Jardín",
];

export default function Navbar() {
  const router = useRouter();
  const sp = useSearchParams();

  const [q, setQ] = useState(sp.get("q") || "");
  const [results, setResults] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Mantener el input sincronizado si cambian los params (navegación)
  useEffect(() => setQ(sp.get("q") || ""), [sp]);

  // fetch de sugerencias (typeahead)
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
        setShowSuggestions(true);
      } catch (err) {
        console.error("Error buscando productos:", err);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [q]);

  const pushWithParams = (next: Record<string, string | undefined>) => {
    const p = new URLSearchParams(sp.toString());
    Object.entries(next).forEach(([k, v]) => {
      if (v === undefined || v === "") p.delete(k);
      else p.set(k, v);
    });
    router.push(`/?${p.toString()}`);
  };

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    pushWithParams({ q });
    setShowSuggestions(false);
  };

  const onCategoryClick = (cat: string) => {
    // normalizamos la categoría para la URL
    const slug = cat
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, "-");

    router.push(`/category/${slug}`);
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
      {/* barra superior */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 relative">
        <Link href="/" className="flex items-center gap-2">
          <img
            src="https://www.perozzi.com.ar/img/logo_perozzi.png"
            alt="Logo"
            className="h-9"
          />
        </Link>

        {/* Buscador con typeahead */}
        <NavbarSearch />

        {/* Acciones */}
        <div className="flex items-center gap-4 text-sm text-gray-700">
          <Link
            href="/login"
            className="flex items-center gap-1 hover:text-blue-600"
          >
            <User className="w-5 h-5" />
            <span className="hidden sm:inline">Iniciar sesión</span>
          </Link>
          <Link
            href="/cart"
            className="flex items-center gap-1 hover:text-blue-600"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="hidden sm:inline">Carrito</span>
          </Link>
        </div>
      </div>

      {/* Categorías */}
      <nav
        className="
      flex flex-wrap md:flex-nowrap
      md:overflow-x-auto overflow-x-hidden
      px-4 bg-gray-50 text-sm shadow-sm
      scrollbar-hide
    "
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryClick(cat)}
            className="px-4 py-2 whitespace-nowrap text-gray-700 hover:bg-gray-100 rounded"
          >
            {cat}
          </button>
        ))}
      </nav>
    </header>
  );
}
