import Carousel from "@/components/Carousel";
import BenefitsBar from "@/components/BenefitsBar";
import CategoriesGrid from "@/components/home/CategoriesGrid";
import HomeProductsSection from "@/components/home/HomeProductsSection";

import { connectDB } from "@/lib/mongodb";
import { initModels } from "@/lib/initModels";
import Category from "@/models/Category";

export const revalidate = 60;

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
    return JSON.parse(JSON.stringify(categories));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const categories = await getCategories();

  return (
    <main className="pt-20 md:pt-32">
      {/* Carousel — visible en todos los viewports */}
      <div className="px-3 sm:px-4 max-w-7xl mx-auto">
        <Carousel />
      </div>

      <BenefitsBar />

      <div className="px-4 max-w-7xl mx-auto">
        <CategoriesGrid categories={categories} />
        <HomeProductsSection />
      </div>
    </main>
  );
}
