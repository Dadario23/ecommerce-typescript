"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProductForm from "@/components/products/ProductForm";

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error("Error cargando producto");

        const data = await res.json();
        setProduct(data);
      } catch (error) {
        console.error("❌ Error cargando producto:", error);
      }
    }

    if (id) fetchProduct();
  }, [id]);

  // 🔥 Ahora recibe el payload ya armado desde ProductForm
  async function handleSubmit(values: any) {
    setLoading(true);

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values), // 👈 ya viene listo
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al actualizar producto");
      }

      router.push("/dashboard/products");
    } catch (error) {
      console.error("❌ Error actualizando producto:", error);
    } finally {
      setLoading(false);
    }
  }

  if (!product) {
    return <p className="p-8">Cargando producto...</p>;
  }

  return (
    <main className="bg-gray-50 min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>

      <ProductForm
        product={product}
        loading={loading}
        onSubmit={handleSubmit}
        actionLabel="Save Changes"
      />
    </main>
  );
}
