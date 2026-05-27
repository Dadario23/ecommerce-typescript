import { connectDB } from "@/lib/mongodb";
import { initModels } from "@/lib/initModels";
import Category from "@/models/Category";
import Product from "@/models/Product";
import CategoryBlock from "./CategoryBlock";
import { slugify } from "@/lib/slugify";

interface CatDoc {
  _id: unknown;
  name: string;
  bannerImage?: string;
  thumbnail?: string;
}

interface ProductDoc {
  slug: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  brand?: string;
}

async function getCategoriesWithProducts(): Promise<{ cat: CatDoc; products: ProductDoc[] }[]> {
  await connectDB();
  initModels();

  const categories = await Category.find({
    status: "published",
    $or: [
      { bannerImage: { $exists: true, $ne: "" } },
      { thumbnail:   { $exists: true, $ne: "" } },
    ],
  })
    .sort({ bannerImage: -1 })
    .limit(4)
    .select("name bannerImage thumbnail")
    .lean<CatDoc[]>();

  if (categories.length === 0) return [];

  const result = await Promise.all(
    categories.map(async (cat) => {
      const products = await Product.find({ category: cat._id, stock: { $gt: 0 } })
        .select("name slug price compareAtPrice images brand")
        .sort({ featured: -1, createdAt: -1 })
        .limit(3)
        .lean<ProductDoc[]>();
      return { cat, products: JSON.parse(JSON.stringify(products)) };
    })
  );

  return result.filter(({ products }) => products.length > 0);
}

export default async function HomeCategoriesSection() {
  const data = await getCategoriesWithProducts();
  if (data.length === 0) return null;

  return (
    <section className="mt-10 space-y-5">
      <h2 className="text-xl font-bold text-gray-900">Destacados por categoría</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {data.map(({ cat, products }) => (
          <CategoryBlock
            key={String(cat._id)}
            bannerImage={cat.bannerImage ?? ""}
            thumbnail={cat.thumbnail ?? ""}
            bannerTitle={cat.name}
            categorySlug={slugify(cat.name)}
            products={products}
          />
        ))}
      </div>
    </section>
  );
}
