"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { LinkIcon } from "lucide-react";

export default function EditCategoryPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos de la categoría
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await fetch(`/api/categories/${id}`);
        if (!res.ok) throw new Error("Error al cargar la categoría");
        const data = await res.json();
        setCategory(data);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchCategory();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(category),
      });
      if (!res.ok) throw new Error("Error al actualizar categoría");
      router.push("/dashboard/categories");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (error) return <p className="p-6 text-red-500">{error}</p>;
  if (!category) return <p className="p-6">Cargando...</p>;

  return (
    <main className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <span>Dashboard</span>
        <span>›</span>
        <span>eCommerce</span>
        <span>›</span>
        <span className="text-foreground">Editar Categoría</span>
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
              {/* Preview */}
              <div className="flex justify-center">
                {category.thumbnail ? (
                  <img
                    src={category.thumbnail}
                    alt="Vista previa"
                    className="w-32 h-32 object-cover rounded border"
                  />
                ) : (
                  <div className="w-32 h-32 border-2 border-dashed rounded flex items-center justify-center text-muted-foreground">
                    <span className="text-sm text-center">Sin imagen</span>
                  </div>
                )}
              </div>

              {/* URL de imagen */}
              <div>
                <Label htmlFor="thumbnail" className="text-sm font-medium">
                  URL de la imagen
                </Label>
                <div className="flex items-center gap-2 mt-1">
                  <LinkIcon className="w-4 h-4 text-muted-foreground" />
                  <Input
                    id="thumbnail"
                    placeholder="https://ejemplo.com/imagen.jpg"
                    value={category.thumbnail || ""}
                    onChange={(e) =>
                      setCategory({ ...category, thumbnail: e.target.value })
                    }
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  URL de imagen externa (Cloudinary, S3, etc.)
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
              <Select
                value={category.status || "published"}
                onValueChange={(value) =>
                  setCategory({ ...category, status: value })
                }
              >
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
              <Select
                value={category.template || "default"}
                onValueChange={(value) =>
                  setCategory({ ...category, template: value })
                }
              >
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
                  value={category.name || ""}
                  onChange={(e) =>
                    setCategory({ ...category, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={category.description || ""}
                  onChange={(e) =>
                    setCategory({ ...category, description: e.target.value })
                  }
                  rows={5}
                />
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
                  value={category.metaTitle || ""}
                  onChange={(e) =>
                    setCategory({ ...category, metaTitle: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="metaDescription">Meta Tag Description</Label>
                <Textarea
                  id="metaDescription"
                  value={category.metaDescription || ""}
                  onChange={(e) =>
                    setCategory({
                      ...category,
                      metaDescription: e.target.value,
                    })
                  }
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="metaKeywords">Meta Tag Keywords</Label>
                <Input
                  id="metaKeywords"
                  value={category.metaKeywords || ""}
                  onChange={(e) =>
                    setCategory({ ...category, metaKeywords: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Botón Guardar */}
          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </div>
      </form>
    </main>
  );
}
