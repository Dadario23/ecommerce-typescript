"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Category {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  thumbnail?: string;
}

interface CategoriesGridProps {
  categories: Category[];
}

// SVG placeholder como data URL (SIEMPRE disponible)
const PLACEHOLDER_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64' fill='none'%3E%3Crect width='64' height='64' fill='%23f3f4f6'/%3E%3Cpath d='M32 28C33.1 28 34 27.1 34 26C34 24.9 33.1 24 32 24C30.9 24 30 24.9 30 26C30 27.1 30.9 28 32 28ZM32 40C36.4 40 40 36.4 40 32C40 27.6 36.4 24 32 24C27.6 24 24 27.6 24 32C24 36.4 27.6 40 32 40Z' fill='%239ca3af'/%3E%3C/svg%3E";

function getCategoryImage(category: Category): string {
  // 1. Thumbnail desde la base de datos (SIEMPRE prioridad)
  if (
    category.thumbnail &&
    category.thumbnail.trim() !== "" &&
    category.thumbnail.startsWith("http")
  ) {
    return category.thumbnail;
  }

  // 2. Placeholder final (sin lógica por nombre)
  return PLACEHOLDER_SVG;
}

function generateSlug(category: Category): string {
  if (category.slug) return category.slug;
  return category.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export default function CategoriesGrid({ categories }: CategoriesGridProps) {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const handleImageError = (categoryId: string, imageUrl: string) => {
    console.error(
      `❌ Error cargando imagen para categoría ${categoryId}:`,
      imageUrl,
    );
    setImageErrors((prev) => new Set(prev).add(categoryId));
  };

  const getFinalImageUrl = (category: Category): string => {
    const originalUrl = getCategoryImage(category);

    // Si esta categoría ya tuvo error, usar placeholder SVG
    if (imageErrors.has(category._id)) {
      return PLACEHOLDER_SVG;
    }

    return originalUrl;
  };

  // DEBUG: Ver qué categorías se están renderizando
  useEffect(() => {
    console.log("🔍 CategoriesGrid DEBUG:");
    categories.forEach((category) => {
      const imageUrl = getCategoryImage(category);
      console.log(`- ${category.name}:`, {
        hasThumbnail: !!category.thumbnail,
        thumbnail: category.thumbnail,
        finalImage: imageUrl,
        usesPlaceholder: imageUrl === PLACEHOLDER_SVG,
      });
    });
  }, [categories]);

  if (categories.length === 0) {
    return (
      <div className="bg-gray-100 mt-6 p-6 rounded-lg text-center">
        <p className="text-gray-500">No hay categorías disponibles</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 mt-6 p-6 rounded-lg">
      {/* <h2 className="text-2xl font-bold text-center mb-6">
        Nuestras Categorías
      </h2> */}
      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 text-center">
        {categories.map((category) => {
          const slug = generateSlug(category);
          const imageUrl = getFinalImageUrl(category);

          return (
            <Link
              key={category._id}
              href={`/category/${slug}`}
              className="flex flex-col items-center cursor-pointer group hover:scale-105 transition-transform duration-200"
            >
              <div className="w-36 h-36 rounded-full border-2 border-white bg-white group-hover:border-blue-500 transition-colors duration-200 overflow-hidden flex items-center justify-center">
                <img
                  src={imageUrl}
                  alt={category.name}
                  className="w-42 h-42 object-contain"
                  onError={() => handleImageError(category._id, imageUrl)}
                  key={`${category._id}-${imageUrl}`}
                />
              </div>
              <p className="mt-2 text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
                {category.name}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
