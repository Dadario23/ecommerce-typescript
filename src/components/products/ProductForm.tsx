"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import GeneralSection from "./sections/GeneralSection";
import MediaSection from "./sections/MediaSection";
import PricingSection from "./sections/PricingSection";
import StatusSection from "./sections/StatusSection";
import ProductDetailsSection from "./sections/ProductDetailsSection";

interface ImageItem {
  id: string;
  file?: File;
  preview: string;
  existing?: boolean;
}

interface Product {
  name?: string;
  description?: string;
  price?: number;
  compareAtPrice?: number;
  images?: string[];
  isActive?: boolean;
  featured?: boolean;
  category?: { _id: string } | string;
  brand?: string;
  sku?: string;
  stock?: number;
}

interface ProductFormProps {
  product?: Product;
  loading: boolean;
  onSubmit: (data: Record<string, unknown>) => void;
  actionLabel: string;
}

export default function ProductForm({ product, loading, onSubmit, actionLabel }: ProductFormProps) {
  const [images, setImages] = useState<ImageItem[]>(
    product?.images?.map((url) => ({ id: crypto.randomUUID(), preview: url, existing: true })) || []
  );

  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    return data.secure_url as string;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const finalImageUrls: string[] = [];
    for (const img of images) {
      if (img.existing) {
        finalImageUrls.push(img.preview);
      } else if (img.file) {
        const url = await uploadToCloudinary(img.file);
        finalImageUrls.push(url);
      }
    }

    const isActiveRaw = formData.get("isActive");

    onSubmit({
      name: formData.get("name"),
      description: formData.get("description"),
      price: Number(formData.get("price")),
      compareAtPrice: formData.get("compareAtPrice") ? Number(formData.get("compareAtPrice")) : undefined,
      category: formData.get("category") ? String(formData.get("category")) : undefined,
      brand: formData.get("brand"),
      sku: formData.get("sku"),
      stock: formData.get("stock") ? Number(formData.get("stock")) : 0,
      images: finalImageUrls,
      isActive: isActiveRaw === "true",
      featured: formData.get("featured") === "true",
    });
  };

  return (
    <form id="product-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <GeneralSection product={product} />
        <MediaSection product={product} onImagesChange={setImages} />
        <PricingSection product={product} />
      </div>

      <div className="space-y-6">
        <StatusSection product={product} />
        <ProductDetailsSection product={product} />
      </div>

      <div className="lg:col-span-3 sticky bottom-0 bg-white border-t border-gray-100 flex justify-end gap-3 px-6 py-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-[#1E3A8A] text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-800 transition-colors disabled:opacity-60 flex items-center gap-2"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
          ) : actionLabel}
        </button>
      </div>
    </form>
  );
}
