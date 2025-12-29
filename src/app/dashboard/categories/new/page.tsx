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
import { Upload, Link as LinkIcon } from "lucide-react";

export default function NewCategoryPage() {
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setThumbnail(e.target.files[0]);
      setThumbnailUrl("");
    }
  };

  const handleThumbnailUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setThumbnailUrl(e.target.value);
    setThumbnail(null);
  };

  const getPreviewImage = () => {
    if (thumbnail) return URL.createObjectURL(thumbnail);
    if (thumbnailUrl) return thumbnailUrl;
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    /* ===== VALIDACIONES (SOLO LÓGICA) ===== */
    if (!name.trim()) {
      setError("El nombre de la categoría es obligatorio");
      return;
    }

    if (name.trim().length < 3) {
      setError("El nombre debe tener al menos 3 caracteres");
      return;
    }

    if (!thumbnail && !thumbnailUrl.trim()) {
      setError("Debes subir una imagen o ingresar una URL");
      return;
    }

    if (description && description.trim().length < 10) {
      setError("La descripción debe tener al menos 10 caracteres");
      return;
    }
    /* ===================================== */

    try {
      setLoading(true);
      setError(null);

      const newCategory: any = {
        name,
        description,
        status: "published",
      };

      if (thumbnailUrl.trim()) {
        newCategory.thumbnail = thumbnailUrl.trim();
      }

      if (thumbnail) {
        console.log("Subir archivo:", thumbnail);
      }

      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory),
      });

      if (res.ok) {
        setName("");
        setDescription("");
        setThumbnail(null);
        setThumbnailUrl("");
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

  const previewImage = getPreviewImage();

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
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Vista previa"
                    className="w-32 h-32 object-cover rounded border"
                  />
                ) : (
                  <div className="w-32 h-32 border-2 border-dashed rounded flex items-center justify-center text-muted-foreground">
                    <span className="text-sm text-center">Vista previa</span>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="file-upload" className="text-sm font-medium">
                  Subir imagen
                </Label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition mt-1">
                  <Upload className="w-6 h-6 mb-1 text-muted-foreground" />
                  <span className="text-sm">Click para subir</span>
                  <span className="text-xs text-muted-foreground">
                    *.png, *.jpg, *.jpeg
                  </span>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">O</span>
                </div>
              </div>

              <div>
                <Label htmlFor="thumbnail-url" className="text-sm font-medium">
                  Pegar URL de imagen
                </Label>
                <div className="flex items-center gap-2 mt-1">
                  <LinkIcon className="w-4 h-4 text-muted-foreground" />
                  <Input
                    id="thumbnail-url"
                    placeholder="https://ejemplo.com/imagen.jpg"
                    value={thumbnailUrl}
                    onChange={handleThumbnailUrlChange}
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Pegar URL de imagen externa (Cloudinary, S3, etc.)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Select defaultValue="published" name="status">
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
              <Select defaultValue="default" name="template">
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
                />
                {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
                <p className="text-xs text-muted-foreground mt-1">
                  A category name is required and recommended to be unique.
                </p>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
                <Input
                  id="metaTitle"
                  placeholder="Meta tag name"
                  name="metaTitle"
                />
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
                  name="metaDescription"
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
                  name="metaKeywords"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Separate the keywords by adding a comma between each keyword.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Botón */}
          <div className="flex justify-end">
            <Button type="submit">
              {loading ? "Creando..." : "Guardar Categoría"}
            </Button>
          </div>
        </div>
      </form>
    </main>
  );
}
