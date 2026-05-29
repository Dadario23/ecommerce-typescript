import Carousel from "@/components/Carousel";
import BenefitsBar from "@/components/BenefitsBar";
import CategoriesGrid from "@/components/home/CategoriesGrid";
import HomeProductsSection from "@/components/home/HomeProductsSection";
import HomeCategoriesSection from "@/components/home/HomeCategoriesSection";
import SupportBanner from "@/components/home/SupportBanner";

import { connectDB } from "@/lib/mongodb";
import { initModels } from "@/lib/initModels";
import Category from "@/models/Category";
import Setting from "@/models/Setting";

export const revalidate = 60;

interface CategoryDoc {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  thumbnail?: string;
  bannerImage?: string;
}

async function getPageData() {
  try {
    await connectDB();
    initModels();
    const [categoriesRaw, setting] = await Promise.all([
      Category.find({ status: "published" }, "name slug description thumbnail bannerImage")
        .sort({ name: 1 })
        .lean<CategoryDoc[]>(),
      Setting.findOne({}, "carouselImages homeFeaturedMode").lean<{
        carouselImages?: string[];
        homeFeaturedMode?: "products" | "categories";
      }>(),
    ]);

    const categories: CategoryDoc[] = JSON.parse(JSON.stringify(categoriesRaw));

    // Pre-filter categories that have an image for HomeCategoriesSection
    const categoriesWithImages = categories
      .filter((c) => c.bannerImage || c.thumbnail)
      .slice(0, 4);

    return {
      categories,
      categoriesWithImages,
      carouselImages:   setting?.carouselImages   ?? [],
      homeFeaturedMode: setting?.homeFeaturedMode ?? "products",
    };
  } catch {
    return {
      categories: [],
      categoriesWithImages: [],
      carouselImages: [],
      homeFeaturedMode: "products" as const,
    };
  }
}

export default async function HomePage() {
  const { categories, categoriesWithImages, carouselImages, homeFeaturedMode } = await getPageData();

  return (
    <main className="pt-20 md:pt-32">
      <div className="px-3 sm:px-4 max-w-7xl mx-auto">
        <Carousel images={carouselImages.length ? carouselImages : undefined} />
      </div>

      <BenefitsBar />

      <div className="px-4 max-w-7xl mx-auto">
        <div className="mt-6 mb-6">
          <SupportBanner />
        </div>
        <CategoriesGrid categories={categories} />

        {homeFeaturedMode === "categories"
          ? <HomeCategoriesSection categories={categoriesWithImages} />
          : <HomeProductsSection />
        }
      </div>
    </main>
  );
}
