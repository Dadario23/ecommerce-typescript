"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProductForm from "@/components/products/ProductForm";

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const payload = Object.fromEntries(formData);
    await fetch(`/api/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    router.push("/dashboard/products");
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
