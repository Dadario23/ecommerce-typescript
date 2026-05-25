import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import ProductPageClient from "./ProductPageClient";
import { IProduct } from "@/models/Product";
import type { Metadata } from "next";

export const revalidate = 60;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  await connectDB();
  const { slug } = await params;
  const doc = await Product.findOne({ slug }).select("name description images").lean<IProduct>();
  if (!doc) return { title: "Producto no encontrado" };

  return {
    title: `${doc.name} | Compumobile`,
    description: doc.description?.slice(0, 160) ?? `Comprá ${doc.name} al mejor precio.`,
    openGraph: {
      title: doc.name,
      description: doc.description?.slice(0, 160) ?? "",
      images: doc.images?.[0] ? [{ url: doc.images[0] }] : [],
    },
  };
}

const BASE_URL =
  process.env.NEXT_PUBLIC_URL ||
  process.env.NEXTAUTH_URL ||
  "http://localhost:3000";

export default async function ProductPage({ params }: ProductPageProps) {
  await connectDB();

  const { slug } = await params;
  const formattedSlug = decodeURIComponent(slug).toLowerCase().replace(/\s+/g, "-");

  const doc = await Product.findOne({ slug: formattedSlug })
    .populate("category", "name slug")
    .lean<IProduct>();
  if (!doc) return notFound();

  const product = JSON.parse(JSON.stringify(doc));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images ?? [],
    ...(product.sku && { sku: product.sku }),
    ...(product.brand && { brand: { "@type": "Brand", name: product.brand } }),
    offers: {
      "@type": "Offer",
      url: `${BASE_URL}/products/${product.slug}`,
      priceCurrency: "ARS",
      price: product.price,
      availability:
        (product.stock ?? 0) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductPageClient product={product} />
    </>
  );
}
