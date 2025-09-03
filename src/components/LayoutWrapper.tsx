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

  // Ocultamos el Navbar en /dashboard y subrutas
  const hideNavbar = pathname.startsWith("/dashboard");

  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
    </>
  );
}
