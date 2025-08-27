import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import ProductPageClient from "./ProductPageClient";
import { IProduct } from "@/models/Product";

interface ProductPageProps {
  params: Promise<{ slug: string }>; // 👈 Importante: ahora es una promesa
}

export default async function ProductPage({ params }: ProductPageProps) {
  await connectDB();

  // 👇 Esperamos la promesa de params
  const { slug } = await params;

  const formattedSlug = decodeURIComponent(slug)
    .toLowerCase()
    .replace(/\s+/g, "-");

  // Buscamos el producto en la base de datos
  const doc = await Product.findOne({ slug: formattedSlug }).lean<IProduct>();
  if (!doc) return notFound();

  const product = JSON.parse(JSON.stringify(doc));

  return <ProductPageClient product={product} />;
}
