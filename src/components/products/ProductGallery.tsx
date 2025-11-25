"use client";
import ImageGallery from "@/components/ImageGallery";
import { IProduct } from "@/models/Product";

function processImages(product: IProduct): string[] {
  try {
    const images: string[] = [];

    // 1. Imagen principal
    if (product.imageUrl && typeof product.imageUrl === "string") {
      const cleanUrl = product.imageUrl.trim();
      if (cleanUrl.startsWith("http")) {
        images.push(cleanUrl);
      }
    }

    // 2. Procesar array de imágenes secundarias
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach((img) => {
        if (typeof img === "string") {
          const cleanImg = img.trim();

          // Caso: string con múltiples URLs
          if (cleanImg.includes(",") || cleanImg.includes("\n")) {
            const urls = cleanImg
              .split(/[,\n]+/)
              .map((url) => url.trim())
              .filter(
                (url) =>
                  url.length > 0 && url.startsWith("http") && !url.includes(" ") // URLs válidas no deberían tener espacios
              );

            images.push(...urls);
          }
          // Caso: URL individual válida
          else if (cleanImg.startsWith("http")) {
            images.push(cleanImg);
          }
        }
      });
    }

    // Eliminar duplicados y asegurar que sean URLs válidas
    const uniqueImages = [...new Set(images)].filter(
      (url) => url && url.startsWith("http")
    );

    console.log("🖼️ Imágenes procesadas:", {
      originalImages: product.images,
      processedCount: uniqueImages.length,
      processedUrls: uniqueImages,
    });

    return uniqueImages;
  } catch (error) {
    console.error("Error procesando imágenes:", error);
    // Fallback: solo la imagen principal
    return product.imageUrl ? [product.imageUrl] : [];
  }
}

export default function ProductGallery({ product }: { product: IProduct }) {
  const processedImages = processImages(product);

  return (
    <div className="w-full md:w-1/2">
      <ImageGallery images={processedImages} productName={product.name} />
    </div>
  );
}
