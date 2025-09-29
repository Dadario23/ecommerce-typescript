"use client";

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
  product?: any; // usarás tu interfaz Product aquí
  loading: boolean;
  onSubmit: (formData: FormData) => void;
  actionLabel: string;
}

export default function ProductForm({
  product,
  loading,
  onSubmit,
  actionLabel,
}: ProductFormProps) {
  return (
    <form
      id="product-form"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        onSubmit(formData);
      }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      {/* Columna izquierda */}
      <div className="lg:col-span-2 space-y-6">
        <GeneralSection product={product} />
        <MediaSection product={product} />
        <PricingSection product={product} />
      </div>

      {/* Columna derecha */}
      <div className="space-y-6">
        <Card>
          <img
            src={product?.imageUrl || "/placeholder.png"}
            alt={product?.name || "preview"}
            className="w-32 h-32 object-contain mx-auto mt-6"
          />
        </Card>
        <StatusSection product={product} />
        <ProductDetailsSection product={product} />
        <ProductTemplateSection product={product} />
        <MetricsSection />
      </div>

      {/* Footer fijo */}
      <div className="lg:col-span-3 sticky bottom-0 bg-white border-t flex justify-end p-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : actionLabel}
        </Button>
      </div>
    </form>
  );
}
