"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProductForm from "@/components/products/ProductForm";

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(payload: any) {
    try {
      setLoading(true);

      console.log("🚀 Payload enviado:", payload);

      const res = await fetch(`/api/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("📡 Status:", res.status);

      const data = await res.json();
      console.log("📦 Response:", data);

      if (!res.ok) {
        throw new Error(data.error || "Error creando producto");
      }

      router.push("/dashboard/products");
    } catch (error) {
      console.error("❌ Error creando producto:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="bg-gray-50 min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">Add Product</h1>
      <ProductForm
        loading={loading}
        onSubmit={handleSubmit}
        actionLabel="Add Product"
      />
    </main>
  );
}
