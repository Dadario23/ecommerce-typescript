"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import GeneralSection from "./sections/GeneralSection";
import MediaSection from "./sections/MediaSection";
import PricingSection from "./sections/PricingSection";
import StatusSection from "./sections/StatusSection";
import ProductDetailsSection from "./sections/ProductDetailsSection";
import ProductTemplateSection from "./sections/ProductTemplateSection";
import MetricsSection from "./sections/MetricsSection";

interface ProductFormProps {
  product?: any;
  loading: boolean;
  onSubmit: (data: any) => void;
  actionLabel: string;
}

export default function ProductForm({
  product,
  loading,
  onSubmit,
  actionLabel,
}: ProductFormProps) {
  const [images, setImages] = useState<any[]>(product?.images || []);

  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return data.secure_url;
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

    const payload = {
      name: formData.get("name"),
      description: formData.get("description"),
      price: Number(formData.get("price")),
      compareAtPrice: formData.get("compareAtPrice")
        ? Number(formData.get("compareAtPrice"))
        : undefined,
      category: formData.get("category")
        ? String(formData.get("category"))
        : undefined,
      brand: formData.get("brand"),
      sku: formData.get("sku"),
      stock: formData.get("stock") ? Number(formData.get("stock")) : 0,
      images: finalImageUrls,
    };

    onSubmit(payload);
  };

  return (
    <form
      id="product-form"
      onSubmit={handleSubmit}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      {/* Columna izquierda */}
      <div className="lg:col-span-2 space-y-6">
        <GeneralSection product={product} />

        {/* 🔥 MediaSection ahora devuelve URLs */}
        <MediaSection product={product} onImagesChange={setImages} />

        <PricingSection product={product} />
      </div>

      {/* Columna derecha */}
      <div className="space-y-6">
        <Card className="p-4">
          <StatusSection product={product} />
        </Card>

        <ProductDetailsSection product={product} />
        <ProductTemplateSection product={product} />
        <MetricsSection />
      </div>

      {/* Footer */}
      <div className="lg:col-span-3 sticky bottom-0 bg-white border-t flex justify-end p-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : actionLabel}
        </Button>
      </div>
    </form>
  );
}
