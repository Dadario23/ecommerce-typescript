"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function NavbarSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [show, setShow] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const delay = setTimeout(async () => {
      const res = await fetch(
        `/api/products/search?query=${query}&mode=suggest`
      );

      const data = await res.json();
      setResults(data);
      setShow(true);
    }, 300);

    return () => clearTimeout(delay);
  }, [query]);

  const handleSearch = () => {
    if (query.trim().length > 0) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setShow(false);
    }
  };

  return (
    <div className="relative w-full max-w-md">
      {/* Input con botón lupa a la derecha */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar productos..."
          className="w-full rounded-lg border pr-10 pl-3 py-2 focus:border-blue-400 focus:ring focus:ring-blue-200"
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button
          type="button"
          onClick={handleSearch}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>

      {/* Dropdown de sugerencias */}
      {show && results.length > 0 && (
        <ul className="absolute top-full mt-2 w-full rounded-lg border bg-white shadow-lg z-50 max-h-80 overflow-y-auto">
          {results.map((p) => (
            <li
              key={p.slug}
              onClick={() => {
                router.push(`/products/${p.slug}`);
                setQuery("");
                setShow(false);
              }}
              className="flex items-center gap-3 cursor-pointer px-3 py-2 hover:bg-gray-100"
            >
              {/* Miniatura */}
              <img
                src={p.image || "/placeholder.png"}
                alt={p.name}
                className="w-12 h-12 object-cover rounded-md border"
              />

              {/* Info producto */}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800 line-clamp-2">
                  {p.name}
                </p>
                <p className="text-red-600 font-semibold text-sm">${p.price}</p>
              </div>

              {/* Etiqueta */}
              <span className="text-xs text-gray-500">Producto</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
