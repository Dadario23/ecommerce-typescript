"use client";
import ImageGallery from "@/components/ImageGallery";
import { IProduct } from "@/models/Product";

export default function ProductGallery({ product }: { product: IProduct }) {
  return (
    <div className="w-full md:w-1/2">
      <ImageGallery
        images={product.images ?? [product.imageUrl]}
        productName={product.name}
      />
    </div>
  );
}
