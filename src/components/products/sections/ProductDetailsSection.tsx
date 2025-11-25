"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { normalizeCategories, CategoryOption } from "@/lib/normalizeCategories";

export default function ProductDetailsSection({ product }: { product?: any }) {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        const normalized = normalizeCategories(
          Array.isArray(data) ? data : data.categories || []
        );
        setCategories(normalized);

        // 👇 si estamos en edición, seteamos la categoría por defecto
        if (product?.category) {
          const defaultValue =
            typeof product.category === "object"
              ? product.category._id
              : String(product.category);

          setSelectedCategory(defaultValue);
        }
      } catch (err) {
        console.error("Error fetching categories", err);
      }
    };

    fetchCategories();
  }, [product?.category]);

  return (
    <Card className="rounded-2xl shadow-sm border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Product Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Category */}
        <div>
          <Label className="text-sm font-medium">Category</Label>
          <Select
            name="category"
            value={selectedCategory}
            onValueChange={(val) => setSelectedCategory(val)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat._id} value={cat._id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Brand */}
        <div>
          <Label className="text-sm font-medium">Brand</Label>
          <Input className="mt-1" name="brand" defaultValue={product?.brand} />
        </div>

        {/* SKU */}
        <div>
          <Label className="text-sm font-medium">SKU</Label>
          <Input className="mt-1" name="sku" defaultValue={product?.sku} />
        </div>

        {/* Stock */}
        <div>
          <Label className="text-sm font-medium">Stock</Label>
          <Input
            className="mt-1"
            type="number"
            name="stock"
            min={0}
            defaultValue={product?.stock}
          />
        </div>
      </CardContent>
    </Card>
  );
}
