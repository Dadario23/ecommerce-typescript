"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ShoppingCart,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Search,
} from "lucide-react";
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
import Image from "next/image";

interface Category {
  _id: string;
  name: string;
  slug?: string;
}

export default function Navbar() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const { isLoading } = useCartWithSession();
  const itemsCount = useCartStore((state) =>
    state.items.reduce((acc, item) => acc + item.quantity, 0),
  );
  const { toggle } = useCartUI();

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

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

  const onCategoryClick = (category: Category) => {
    const slug =
      category.slug ||
      category.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[\s-]+/g, "-")
        .replace(/^-+|-+$/g, "");

    setMobileMenuOpen(false);
    router.push(`/category/${slug}`);
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
      {/* TOP BAR */}
      <div className="relative flex items-center justify-between px-4 py-4 md:py-5 border-b border-gray-200">
        {/* LEFT SECTION (Mobile only) */}
        <div className="flex items-center gap-4 md:hidden">
          {/* Hamburger */}
          <button onClick={() => setMobileMenuOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>

          {/* Search icon */}
          <button onClick={() => setMobileSearchOpen((prev) => !prev)}>
            <Search className="w-5 h-5" />
          </button>
        </div>

        {/* LOGO DESKTOP */}
        <Link href="/" className="hidden md:flex items-center gap-2">
          <Image src="/logo.svg" alt="Logo" width={195} height={47} priority />
        </Link>

        {/* LOGO MOBILE (centered) */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2 md:hidden">
          <Image src="/logo.svg" alt="Logo" width={160} height={40} priority />
        </Link>

        {/* SEARCH DESKTOP */}
        <div className="hidden md:block w-full max-w-xl mx-8">
          <NavbarSearch />
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-4 text-sm text-gray-700">
          {status === "loading" ? (
            <User className="w-5 h-5" />
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                  <User className="w-5 h-5" />
                  <span className="hidden sm:inline">
                    {session.user?.name?.split(" ")[0] || "Usuario"}
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
                  className="cursor-pointer text-red-600"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <User className="w-5 h-5" />
            </Link>
          )}

          {/* CART */}
          <button
            onClick={toggle}
            disabled={isLoading}
            className="relative flex items-center"
          >
            <ShoppingCart className="w-5 h-5" />

            {!isLoading && itemsCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {itemsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* MOBILE SEARCH (Real search component) */}
      {mobileSearchOpen && (
        <div className="md:hidden px-4 py-4 border-b bg-white shadow-md">
          <NavbarSearch />
        </div>
      )}

      {/* CATEGORY NAV - Desktop only */}
      <nav className="hidden md:flex flex-nowrap overflow-x-auto px-4 bg-gray-50 text-sm shadow-sm">
        {categoriesLoading
          ? null
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

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/40">
          <div className="w-64 bg-white h-full p-4 shadow-lg">
            <div className="flex justify-between mb-4">
              <span className="font-semibold">Menú</span>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => onCategoryClick(category)}
                  className="text-left py-2 border-b"
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
