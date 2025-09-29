"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(true);
  const [catalogOpen, setCatalogOpen] = useState(false);

  // Abrir catálogo si estamos en subrutas
  useEffect(() => {
    if (
      pathname.startsWith("/dashboard/products") ||
      pathname.startsWith("/dashboard/categories")
    ) {
      setCatalogOpen(true);
    }
  }, [pathname]);

  return (
    <aside
      className={cn(
        "h-screen border-r bg-white transition-all duration-300 flex flex-col",
        expanded ? "w-64" : "w-20"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b">
        {expanded && <span className="text-lg font-bold">MyShop</span>}
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 rounded hover:bg-gray-100"
        >
          {expanded ? (
            <ChevronLeft className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Menú */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {/* Dashboard */}
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100",
            pathname === "/dashboard" && "bg-gray-100 font-medium"
          )}
        >
          <LayoutDashboard className="h-5 w-5" />
          {expanded && <span>Dashboard</span>}
        </Link>

        {/* Catálogo */}
        <div>
          <button
            onClick={() => setCatalogOpen(!catalogOpen)}
            className={cn(
              "flex items-center w-full gap-2 px-3 py-2 rounded-lg hover:bg-gray-100",
              (pathname.startsWith("/dashboard/products") ||
                pathname.startsWith("/dashboard/categories")) &&
                "bg-gray-100 font-medium"
            )}
          >
            <Package className="h-5 w-5" />
            {expanded && <span className="flex-1 text-left">Catálogo</span>}
            {expanded && (
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  catalogOpen ? "rotate-180" : ""
                )}
              />
            )}
          </button>

          {/* Submenú solo si expandido */}
          {expanded && catalogOpen && (
            <div className="ml-8 mt-1 space-y-1">
              <Link
                href="/dashboard/products"
                className={cn(
                  "block px-3 py-2 rounded-lg hover:bg-gray-100",
                  pathname === "/dashboard/products" &&
                    "bg-gray-100 font-medium"
                )}
              >
                Productos
              </Link>
              <Link
                href="/dashboard/products/new"
                className={cn(
                  "block px-3 py-2 rounded-lg hover:bg-gray-100",
                  pathname === "/dashboard/products/new" &&
                    "bg-gray-100 font-medium"
                )}
              >
                Agregar producto
              </Link>
              <Link
                href="/dashboard/categories"
                className={cn(
                  "block px-3 py-2 rounded-lg hover:bg-gray-100",
                  pathname === "/dashboard/categories" &&
                    "bg-gray-100 font-medium"
                )}
              >
                Categorías
              </Link>
              <Link
                href="/dashboard/categories/new"
                className={cn(
                  "block px-3 py-2 rounded-lg hover:bg-gray-100",
                  pathname === "/dashboard/categories/new" &&
                    "bg-gray-100 font-medium"
                )}
              >
                Agregar categoría
              </Link>
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}
