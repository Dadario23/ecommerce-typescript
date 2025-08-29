"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Product {
  _id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  description: string;
  imageUrl: string;
  images?: string[];
  category: string;
  brand?: string;
  sku?: string;
}

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagesInput, setImagesInput] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [sku, setSku] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const categories = [
    "TV-Video-Foto",
    "Celulares",
    "Informática",
    "Gaming",
    "Juguetes",
    "Audio",
    "Herramientas",
    "Bazar",
    "Bicicletas",
    "Heladeras",
    "Freezer",
    "Sommiers",
    "Perfumes",
    "Electrodomésticos",
  ];

  async function fetchProducts() {
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Error al cargar productos");
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Error al cargar productos:", error);
      setMessage("Error al cargar productos");
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Validar formato de precios
    if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      setMessage("Error: Por favor ingrese un precio válido");
      setLoading(false);
      return;
    }

    if (
      compareAtPrice &&
      (isNaN(parseFloat(compareAtPrice)) || parseFloat(compareAtPrice) <= 0)
    ) {
      setMessage("Error: Por favor ingrese un precio de comparación válido");
      setLoading(false);
      return;
    }

    try {
      // Procesar las imágenes adicionales
      const additionalImages = imagesInput
        .split(",")
        .map((img) => img.trim())
        .filter((img) => img.length > 0);

      const payload = {
        name,
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : undefined,
        description,
        imageUrl,
        images: additionalImages,
        category,
        brand: brand || undefined,
        sku: sku || undefined,
      };

      const url = editingId ? `/api/products/${editingId}` : "/api/products";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMessage(
          editingId ? "Producto actualizado ✅" : "Producto agregado ✅"
        );
        resetForm();
        fetchProducts();
      } else {
        const errorData = await res.json();
        setMessage(`Error: ${errorData.error || "Error desconocido"}`);
      }
    } catch (error) {
      setMessage("Error en la conexión con el servidor");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setName("");
    setPrice("");
    setCompareAtPrice("");
    setDescription("");
    setImageUrl("");
    setImagesInput("");
    setCategory("");
    setBrand("");
    setSku("");
    setEditingId(null);
  }

  function startEditing(product: Product) {
    setName(product.name);
    setPrice(product.price.toString());
    setCompareAtPrice(product.compareAtPrice?.toString() || "");
    setDescription(product.description);
    setImageUrl(product.imageUrl);
    setImagesInput(product.images?.join(", ") || "");
    setCategory(product.category);
    setBrand(product.brand || "");
    setSku(product.sku || "");
    setEditingId(product._id);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Seguro que quieres eliminar este producto?")) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessage("Producto eliminado ✅");
        fetchProducts();
      } else {
        const errorData = await res.json();
        setMessage(`Error: ${errorData.error}`);
      }
    } catch (error) {
      setMessage("Error al eliminar producto");
      console.error("Error:", error);
    }
  }

  return (
    <main className="pt-[140px] min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6">Panel de Administración</h1>

      {/* Formulario */}
      <Card className="max-w-2xl mx-auto mb-10">
        <CardHeader>
          <CardTitle>
            {editingId ? "Editar Producto" : "Agregar Producto"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoría *</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Precio *</Label>
              <Input
                id="price"
                type="text"
                inputMode="decimal"
                value={price}
                onChange={(e) => {
                  // Permitir solo números y un punto decimal
                  const value = e.target.value.replace(/[^0-9.]/g, "");

                  // Evitar múltiples puntos decimales
                  const decimalCount = (value.match(/\./g) || []).length;
                  if (decimalCount <= 1) {
                    setPrice(value);
                  }
                }}
                onBlur={(e) => {
                  // Formatear al perder el foco
                  let value = e.target.value;
                  if (value && !isNaN(parseFloat(value))) {
                    // Asegurar formato correcto con dos decimales
                    const numValue = parseFloat(value);
                    setPrice(numValue.toFixed(2));
                  } else if (value === "") {
                    setPrice("");
                  }
                }}
                placeholder="0.00"
                required
              />
              <p className="text-sm text-gray-500">
                Use punto como separador decimal
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="compareAtPrice">
                Precio de comparación (opcional)
              </Label>
              <Input
                id="compareAtPrice"
                type="text"
                inputMode="decimal"
                value={compareAtPrice}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9.]/g, "");
                  const decimalCount = (value.match(/\./g) || []).length;
                  if (decimalCount <= 1) {
                    setCompareAtPrice(value);
                  }
                }}
                onBlur={(e) => {
                  let value = e.target.value;
                  if (value && !isNaN(parseFloat(value))) {
                    const numValue = parseFloat(value);
                    setCompareAtPrice(numValue.toFixed(2));
                  } else if (value === "") {
                    setCompareAtPrice("");
                  }
                }}
                placeholder="0.00"
              />
              <p className="text-sm text-gray-500">
                Use punto como separador decimal
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Marca (opcional)</Label>
                <Input
                  id="brand"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU (opcional)</Label>
                <Input
                  id="sku"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">URL de imagen principal *</Label>
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="images">
                URLs de imágenes adicionales (separadas por coma)
              </Label>
              <Textarea
                id="images"
                placeholder="https://imagen1.jpg, https://imagen2.jpg, https://imagen3.jpg"
                value={imagesInput}
                onChange={(e) => setImagesInput(e.target.value)}
                rows={3}
              />
              <p className="text-sm text-gray-500">
                Separa cada URL con una coma. Puedes agregar múltiples imágenes.
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading
                  ? editingId
                    ? "Actualizando..."
                    : "Agregando..."
                  : editingId
                  ? "Actualizar Producto"
                  : "Agregar Producto"}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              )}
            </div>
            {message && (
              <p className="mt-2 text-center text-sm font-medium">{message}</p>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Listado de productos */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Productos ({products.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-gray-500">No hay productos registrados</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Imagen</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Imágenes</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p) => (
                    <TableRow key={p._id}>
                      <TableCell>
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="h-12 w-12 object-cover rounded"
                          />
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>${p.price.toLocaleString()}</TableCell>
                      <TableCell>{p.category}</TableCell>
                      <TableCell>
                        {p.images && p.images.length > 0 ? (
                          <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                            +{p.images.length} adicionales
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEditing(p)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(p._id)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
