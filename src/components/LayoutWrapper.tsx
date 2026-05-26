// src/components/LayoutWrapper.tsx
"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Ocultamos el Navbar de la tienda en /dashboard y /soporte-tecnico (tienen su propio navbar)
  const hideNavbar =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/soporte-tecnico");

  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
    </>
  );
}
