// app/account/layout.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold mb-4">
          Debes iniciar sesión para ver tu cuenta
        </h2>
        <Button onClick={() => (window.location.href = "/login")}>
          Ir a login
        </Button>
      </div>
    );
  }

  const links = [
    { href: "/account/orders", label: "Historial de pedidos" },
    { href: "/account/addresses", label: "Direcciones" },
    { href: "/account/change-password", label: "Cambio de contraseña" },
  ];

  return (
    <div className="pt-[140px] max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Sidebar */}
      <aside className="md:col-span-1 border rounded-lg p-4 space-y-3 bg-gray-50">
        <h2 className="text-lg font-semibold mb-4">Tu cuenta</h2>

        <nav className="space-y-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "block w-full text-left px-3 py-2 rounded-md transition",
                pathname === link.href
                  ? "bg-primary text-white"
                  : "hover:bg-gray-100 text-gray-800"
              )}
            >
              {link.label}
            </Link>
          ))}

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full text-left px-3 py-2 rounded-md hover:bg-red-100 text-red-600 mt-4"
          >
            Cerrar sesión
          </button>
        </nav>
      </aside>

      {/* Contenido principal */}
      <main className="md:col-span-3 border rounded-lg p-6 bg-white">
        {children}
      </main>
    </div>
  );
}
