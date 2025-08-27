"use client";
import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";
import { IProduct } from "@/models/Product";

export default function ProductBreadcrumb({ product }: { product: IProduct }) {
  return (
    <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
      <Link href="/" className="flex items-center gap-1 hover:underline">
        <Home size={16} /> Inicio
      </Link>
      <ChevronRight size={14} />
      <span className="capitalize">{product.category}</span>
      <ChevronRight size={14} />
      <span className="font-semibold">{product.name}</span>
    </nav>
  );
}
