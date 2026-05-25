import { connectDB } from "@/lib/mongodb";
import { initModels } from "@/lib/initModels";
import Category from "@/models/Category";
import Product from "@/models/Product";
import CategoryBlock from "./CategoryBlock";
import Link from "next/link";
import { slugify } from "@/lib/slugify";

interface CategoryDoc {
  _id: string;
  name: string;
  thumbnail?: string;
  bannerImage?: string;
}

interface ProductDoc {
  _id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  brand?: string;
}

async function getCategoriesWithProducts() {
  await connectDB();
  initModels();

  const categories = await Category.find({ status: "published" })
    .sort({ name: 1 })
    .limit(8)
    .lean<CategoryDoc[]>();

  const results = await Promise.all(
    categories.map(async (cat) => {
      const products = await Product.find({ category: cat._id })
        .select("name slug price compareAtPrice images brand")
        .sort({ createdAt: -1 })
        .limit(3)
        .lean<ProductDoc[]>();
      return { category: cat, products };
    })
  );

  return results.filter((r) => r.products.length > 0).slice(0, 4);
}

export default async function HomeProductsSection() {
  const sections = await getCategoriesWithProducts();

  if (sections.length === 0) return null;

  return (
    <section className="mt-10 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Productos destacados</h2>
        <Link
          href="/category"
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Ver todo →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {sections.map(({ category, products }) => (
          <CategoryBlock
            key={String(category._id)}
            bannerImage={category.bannerImage ?? ""}
            thumbnail={category.thumbnail ?? ""}
            bannerTitle={category.name}
            categorySlug={slugify(category.name)}
            products={JSON.parse(JSON.stringify(products))}
          />
        ))}
      </div>
    </section>
  );
}
