// src/app/dashboard/categories/new/page.tsx
"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload } from "lucide-react";

export default function NewCategoryPage() {
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setThumbnail(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("El nombre de la categoría es obligatorio");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const newCategory = {
        name,
        description,
        status: "published",
      };

      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory),
      });

      if (res.ok) {
        console.log("Categoría creada con éxito");
        // reset form
        setName("");
        setDescription("");
      } else {
        const err = await res.json();
        setError(err.message || "Error al crear categoría");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <span>Dashboard</span>
        <span>›</span>
        <span>eCommerce</span>
        <span>›</span>
        <span className="text-foreground">Nueva Categoría</span>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Columna izquierda */}
        <div className="space-y-6">
          {/* Thumbnail */}
          <Card>
            <CardHeader>
              <CardTitle>Thumbnail</CardTitle>
            </CardHeader>
            <CardContent>
              <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer hover:bg-gray-50 transition">
                {thumbnail ? (
                  <img
                    src={URL.createObjectURL(thumbnail)}
                    alt="thumbnail preview"
                    className="w-32 h-32 object-cover rounded"
                  />
                ) : (
                  <div className="flex flex-col items-center text-center text-muted-foreground">
                    <Upload className="w-8 h-8 mb-2" />
                    <span>Click to upload</span>
                    <span className="text-xs">*.png, *.jpg, *.jpeg</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="hidden"
                />
              </label>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Select defaultValue="published">
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Store Template */}
          <Card>
            <CardHeader>
              <CardTitle>Store Template</CardTitle>
            </CardHeader>
            <CardContent>
              <Select defaultValue="default">
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default template</SelectItem>
                  <SelectItem value="custom">Custom template</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {/* Columna derecha */}
        <div className="lg:col-span-2 space-y-6">
          {/* General */}
          <Card>
            <CardHeader>
              <CardTitle>General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                {error && <p className="text-sm text-red-500">{error}</p>}

                <p className="text-xs text-muted-foreground mt-1">
                  A category name is required and recommended to be unique.
                </p>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Type your text here..."
                  rows={5}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Set a description to the category for better visibility.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Meta Options */}
          <Card>
            <CardHeader>
              <CardTitle>Meta Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="metaTitle">Meta Tag Title</Label>
                <Input id="metaTitle" placeholder="Meta tag name" />
                <p className="text-xs text-muted-foreground mt-1">
                  Set a meta tag title. Recommended to be simple and precise
                  keywords.
                </p>
              </div>
              <div>
                <Label htmlFor="metaDescription">Meta Tag Description</Label>
                <Textarea
                  id="metaDescription"
                  placeholder="Type your text here..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Set a meta tag description to the category for increased SEO
                  ranking.
                </p>
              </div>
              <div>
                <Label htmlFor="metaKeywords">Meta Tag Keywords</Label>
                <Input
                  id="metaKeywords"
                  placeholder="keyword1, keyword2, ..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Separate the keywords by adding a comma between each keyword.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Botón Guardar */}
          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? "Creando..." : "Guardar Categoría"}
            </Button>
          </div>
        </div>
      </form>
    </main>
  );
}
