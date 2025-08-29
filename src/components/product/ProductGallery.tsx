"use client";
import ImageGallery from "@/components/ImageGallery";
import { IProduct } from "@/models/Product";

export default function ProductGallery({ product }: { product: IProduct }) {
  // imageUrl como imagen principal, images como secundarias
  const images = product.imageUrl
    ? [product.imageUrl, ...(product.images || [])]
    : product.images || [];

  return (
    <div className="w-full md:w-1/2">
      <ImageGallery images={images} productName={product.name} />
    </div>
  );
}
