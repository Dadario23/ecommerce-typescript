"use client";

import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Tag,
  FolderOpen,
  ChevronDown,
  LogOut,
  Store,
  Plus,
  List,
  Users,
  BarChart2,
  Settings,
  GalleryHorizontal,
  Wrench,
  ClipboardCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface NavChild {
  href: string;
  label: string;
  icon: React.ElementType;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  children?: NavChild[];
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: "Tienda",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/dashboard/orders", label: "Órdenes", icon: ShoppingCart },
      { href: "/dashboard/customers", label: "Clientes", icon: Users },
      { href: "/dashboard/analytics", label: "Analytics", icon: BarChart2 },
      { href: "/dashboard/coupons", label: "Cupones", icon: Tag },
      {
        href: "/dashboard/catalog",
        label: "Catálogo",
        icon: Package,
        children: [
          { href: "/dashboard/products", label: "Productos", icon: List },
          { href: "/dashboard/products/new", label: "Nuevo producto", icon: Plus },
          { href: "/dashboard/categories", label: "Categorías", icon: FolderOpen },
          { href: "/dashboard/categories/new", label: "Nueva categoría", icon: Plus },
        ],
      },
      { href: "/dashboard/carousel", label: "Carousel", icon: GalleryHorizontal },
    ],
  },
  {
    label: "Soporte técnico",
    items: [
      { href: "/dashboard/presupuestos", label: "Presupuestos", icon: ClipboardCheck },
      { href: "/dashboard/reparaciones", label: "Reparaciones", icon: Wrench },
    ],
  },
];

const UTILITY_LINKS = [
  { href: "/", label: "Ver tienda", icon: Store },
  { href: "/dashboard/settings", label: "Configuración", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isCatalogActive =
    pathname.startsWith("/dashboard/products") ||
    pathname.startsWith("/dashboard/categories");

  const [catalogOpen, setCatalogOpen] = useState(isCatalogActive);

  useEffect(() => {
    if (isCatalogActive) setCatalogOpen(true);
  }, [isCatalogActive]);

  const initials = (session?.user?.name || "A")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className="w-64 h-screen bg-slate-900 flex flex-col shrink-0">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-4 border-b border-white/10 shrink-0">
        <div className="relative w-8 h-8 shrink-0">
          <Image
            src="/logo.svg"
            alt="Logo"
            fill
            className="object-contain brightness-0 invert"
          />
        </div>
        <div className="min-w-0">
          <p className="text-white text-sm font-bold leading-tight truncate">Compumobile</p>
          <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">Admin</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            {/* Section label */}
            <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              {section.label}
            </p>

            <div className="space-y-0.5">
              {section.items.map((item) => {
                if (!item.children) {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        active
                          ? "bg-white/10 text-white"
                          : "text-slate-400 hover:bg-white/5 hover:text-white",
                      )}
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      {item.label}
                    </Link>
                  );
                }

                // Collapsible group (Catálogo)
                return (
                  <div key={item.href}>
                    <button
                      onClick={() => setCatalogOpen((p) => !p)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isCatalogActive
                          ? "bg-white/10 text-white"
                          : "text-slate-400 hover:bg-white/5 hover:text-white",
                      )}
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      <span className="flex-1 text-left">{item.label}</span>
                      <ChevronDown
                        className={cn(
                          "w-3.5 h-3.5 transition-transform",
                          catalogOpen ? "rotate-180" : "",
                        )}
                      />
                    </button>

                    {catalogOpen && (
                      <div className="mt-0.5 ml-4 pl-3 border-l border-white/10 space-y-0.5">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors",
                              pathname === child.href
                                ? "text-white bg-white/10"
                                : "text-slate-400 hover:text-white hover:bg-white/5",
                            )}
                          >
                            <child.icon className="w-3.5 h-3.5 shrink-0" />
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Utility links (Ver tienda, Configuración) */}
        <div className="mt-auto pt-3 border-t border-white/10 space-y-0.5">
          {UTILITY_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          ))}
        </div>
      </nav>

      {/* User */}
      <div className="border-t border-white/10 p-3 shrink-0">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">
              {session?.user?.name?.split(" ")[0] || "Admin"}
            </p>
            <p className="text-slate-500 text-[10px] truncate">{session?.user?.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-slate-500 hover:text-red-400 transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
