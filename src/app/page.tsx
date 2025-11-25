import BenefitsBar from "@/components/BenefitsBar";
import Carousel from "@/components/Carousel";
import CatalogBanner from "@/components/home/CatalogBanner";
import HomeProductsSection from "@/components/home/HomeProductsSection";
import CategoriesGrid from "@/components/home/CategoriesGrid";

// Esto hace que la página sea dinámica y siempre tenga las categorías actualizadas
export const dynamic = "force-dynamic";

async function getCategories() {
  try {
    const res = await fetch(
      `${process.env.NEXTAUTH_URL}/api/categories/public`,
      {
        next: { revalidate: 3600 }, // Revalidar cada hora
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch categories");
    }

    const data = await res.json();
    return data.categories || [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export default async function HomePage() {
  const categories = await getCategories();

  return (
    <main className="pt-[140px] px-4 max-w-7xl mx-auto">
      <Carousel />

      {/* Barra de beneficios */}
      <BenefitsBar />

      {/* Categorías dinámicas */}
      <CategoriesGrid categories={categories} />

      {/* Productos */}
      <HomeProductsSection />

      {/* Banner de catálogo */}
      <CatalogBanner />
    </main>
  );
}
