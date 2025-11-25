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
      const res = await fetch(`/api/products/${id}`);
      const data = await res.json();
      setProduct(data);
    }
    fetchProduct();
  }, [id]);

  async function handleSubmit(formData: FormData) {
    setLoading(true);

    // 👇 CORRECCIÓN: Procesar el campo images correctamente
    const imagesInput = formData.get("images") as string;
    const imagesArray = imagesInput
      ? imagesInput
          .split("\n") // Dividir por saltos de línea
          .map((url) => url.trim())
          .filter((url) => url.length > 0 && url.startsWith("http"))
      : [];

    const payload: any = {
      name: formData.get("name"),
      description: formData.get("description"),
      imageUrl: formData.get("imageUrl"),
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
      // 👇 Array correcto de imágenes
      images: imagesArray,
    };

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

  if (!product) return <p className="p-8">Cargando producto...</p>;

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
