"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Store, Search, Wrench, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/soporte-tecnico", label: "Inicio", exact: true },
  { href: "/soporte-tecnico/seguimiento", label: "Mis reparaciones", exact: false },
];

export default function SoporteNavbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : null;

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-slate-900 border-b border-white/10 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-4">

          {/* Logo + sección */}
          <Link href="/soporte-tecnico" className="flex items-center gap-2.5 shrink-0">
            <div className="relative w-6 h-6 shrink-0">
              <Image
                src="/logo.svg"
                alt="Compumobile"
                fill
                className="object-contain brightness-0 invert"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-sm hidden sm:block">Compumobile</span>
              <span className="hidden sm:block text-slate-500 text-sm">·</span>
              <span className="flex items-center gap-1 text-blue-300 text-xs font-semibold uppercase tracking-wider">
                <Wrench className="w-3 h-3" />
                Soporte técnico
              </span>
            </div>
          </Link>

          {/* Nav links — desktop */}
          <nav className="hidden md:flex items-center gap-1 ml-6">
            {NAV_LINKS.map(({ href, label, exact }) => {
              const active = exact ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-white/10 text-white"
                      : "text-slate-400 hover:text-white hover:bg-white/5",
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-2">
            {/* User avatar — if logged in */}
            {session?.user && (
              <div className="hidden sm:flex items-center gap-2 text-slate-400 text-xs">
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                  {initials}
                </div>
                <span className="max-w-24 truncate">{session.user.name?.split(" ")[0]}</span>
              </div>
            )}

            {/* Back to store */}
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white border border-white/15 hover:border-white/30 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Store className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ir a la tienda</span>
              <span className="sm:hidden">Tienda</span>
            </Link>

            {/* Mobile hamburger */}
            <button
              className="md:hidden text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
              onClick={() => setMobileOpen((p) => !p)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav dropdown */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 bg-slate-900 px-4 py-3 space-y-1">
            {NAV_LINKS.map(({ href, label, exact }) => {
              const active = exact ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-white/10 text-white"
                      : "text-slate-400 hover:text-white hover:bg-white/5",
                  )}
                >
                  {label}
                </Link>
              );
            })}

            {session?.user && (
              <div className="flex items-center gap-2 px-3 py-2 text-slate-500 text-xs border-t border-white/10 mt-2 pt-3">
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-[9px] font-bold">
                  {initials}
                </div>
                {session.user.name}
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
}
