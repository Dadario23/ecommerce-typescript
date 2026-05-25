import Carousel from "@/components/Carousel";
import BenefitsBar from "@/components/BenefitsBar";
import CategoriesGrid from "@/components/home/CategoriesGrid";
import HomeProductsSection from "@/components/home/HomeProductsSection";

import { connectDB } from "@/lib/mongodb";
import { initModels } from "@/lib/initModels";
import Category from "@/models/Category";
import Setting from "@/models/Setting";

export const revalidate = 60;

async function getPageData() {
  try {
    await connectDB();
    initModels();
    const [categories, setting] = await Promise.all([
      Category.find({ status: "published" }, "name slug description thumbnail")
        .sort({ name: 1 })
        .lean(),
      Setting.findOne({}, "carouselImages").lean<{ carouselImages?: string[] }>(),
    ]);
    return {
      categories: JSON.parse(JSON.stringify(categories)),
      carouselImages: setting?.carouselImages ?? [],
    };
  } catch {
    return { categories: [], carouselImages: [] };
  }
}

export default async function HomePage() {
  const { categories, carouselImages } = await getPageData();

  return (
    <main className="pt-20 md:pt-32">
      {/* Carousel — visible en todos los viewports */}
      <div className="px-3 sm:px-4 max-w-7xl mx-auto">
        <Carousel images={carouselImages.length ? carouselImages : undefined} />
      </div>

      <BenefitsBar />

      <div className="px-4 max-w-7xl mx-auto">
        <CategoriesGrid categories={categories} />
        <HomeProductsSection />
      </div>
    </main>
  );
}
