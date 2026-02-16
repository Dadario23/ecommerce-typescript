import BenefitsBar from "@/components/BenefitsBar";
import Carousel from "@/components/Carousel";
import CatalogBanner from "@/components/home/CatalogBanner";
import HomeProductsSection from "@/components/home/HomeProductsSection";
import CategoriesGrid from "@/components/home/CategoriesGrid";

import { connectDB } from "@/lib/mongodb";
import { initModels } from "@/lib/initModels";
import Category from "@/models/Category";

// Esto hace que la página sea dinámica
export const dynamic = "force-dynamic";

async function getCategories() {
  try {
    await connectDB();
    initModels();

    const categories = await Category.find(
      { status: "published" },
      "name slug description thumbnail",
    )
      .sort({ name: 1 })
      .lean();

    // 👇 Importante: evitar problemas de serialización con Mongo
    return JSON.parse(JSON.stringify(categories));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export default async function HomePage() {
  const categories = await getCategories();

  return (
    <main className="pt-20 md:pt-32 px-4 max-w-7xl mx-auto">
      <div className="hidden md:block">
        <Carousel />
      </div>

      <BenefitsBar />

      <CategoriesGrid categories={categories} />

      <HomeProductsSection />

      <CatalogBanner />
    </main>
  );
}
