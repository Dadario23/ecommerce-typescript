"use client";

import { useEffect, useState } from "react";
import { normalizeCategories, CategoryOption } from "@/lib/normalizeCategories";

const INPUT =
  "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 placeholder:text-gray-300 transition-colors";

interface Product {
  category?: { _id: string } | string;
  brand?: string;
  sku?: string;
  stock?: number;
  condition?: "new" | "used";
}

export default function ProductDetailsSection({ product }: { product?: Product }) {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        const normalized = normalizeCategories(
          Array.isArray(data) ? data : data.categories || []
        );
        setCategories(normalized);
        if (product?.category) {
          const def =
            typeof product.category === "object"
              ? product.category._id
              : String(product.category);
          setSelectedCategory(def);
        }
      })
      .catch(() => {});
  }, [product?.category]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">Detalles</h2>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1.5 block">
            Categoría <span className="text-red-400">*</span>
          </label>
          <select
            name="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            required
            className={INPUT}
          >
            <option value="" disabled>Seleccioná una categoría</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1.5 block">Marca</label>
          <input
            name="brand"
            defaultValue={product?.brand}
            placeholder="Ej: Samsung, Apple"
            className={INPUT}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1.5 block">SKU</label>
          <input
            name="sku"
            defaultValue={product?.sku}
            placeholder="Ej: IPH15-256-BLK"
            className={INPUT}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1.5 block">Stock</label>
          <input
            type="number"
            name="stock"
            min={0}
            defaultValue={product?.stock ?? 0}
            className={INPUT}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1.5 block">Condición</label>
          <div className="flex gap-2">
            {(["new", "used"] as const).map((val) => (
              <label
                key={val}
                className="flex-1 flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-2.5 cursor-pointer has-[:checked]:border-[#1E3A8A] has-[:checked]:bg-blue-50 transition-colors"
              >
                <input
                  type="radio"
                  name="condition"
                  value={val}
                  defaultChecked={(product?.condition ?? "new") === val}
                  className="accent-[#1E3A8A]"
                />
                <span className="text-sm font-medium text-gray-700">
                  {val === "new" ? "Nuevo" : "Usado"}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
