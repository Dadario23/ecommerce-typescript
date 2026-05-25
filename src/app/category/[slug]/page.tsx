import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { initModels } from "@/lib/initModels";
import Category from "@/models/Category";
import Product from "@/models/Product";
import CategoryClient from "@/components/category/CategoryClient";
import type { Metadata } from "next";
import { slugify } from "@/lib/slugify";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

async function getCategoryAndProducts(slug: string) {
  await connectDB();
  initModels();

  const categories = await Category.find({ status: "published" }).lean<
    { _id: unknown; name: string; thumbnail?: string }[]
  >();

  const requestedSlug = slugify(decodeURIComponent(slug));
  const category = categories.find(
    (c) => slugify(c.name) === requestedSlug
  );

  if (!category) return null;

  const products = await Product.find({ category: category._id })
    .select("name slug price compareAtPrice images brand stock")
    .sort({ createdAt: -1 })
    .lean();

  return {
    category,
    products: JSON.parse(JSON.stringify(products)),
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCategoryAndProducts(slug);
  if (!data) return { title: "Categoría no encontrada" };

  return {
    title: `${data.category.name} | Compumobile`,
    description: `Explorá nuestra selección de ${data.category.name}. Encontrá los mejores precios y opciones de financiación.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const data = await getCategoryAndProducts(slug);

  if (!data) notFound();

  return (
    <CategoryClient
      categoryName={data.category.name}
      initialProducts={data.products}
    />
  );
}
