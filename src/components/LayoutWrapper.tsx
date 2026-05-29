// src/components/LayoutWrapper.tsx
"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import type { PublicCategory } from "@/lib/getPublicCategories";

export default function LayoutWrapper({
  children,
  categories,
}: {
  children: React.ReactNode;
  categories: PublicCategory[];
}) {
  const pathname = usePathname();

  const hideNavbar =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/soporte-tecnico");

  return (
    <>
      {!hideNavbar && <Navbar initialCategories={categories} />}
      {children}
    </>
  );
}
