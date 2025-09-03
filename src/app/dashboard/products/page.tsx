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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

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
  stock?: number;
  isActive?: boolean;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // form states
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagesInput, setImagesInput] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [sku, setSku] = useState("");
  const [stock, setStock] = useState("");
  const [isActive, setIsActive] = useState("true");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");

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
    setStock("");
    setIsActive("true");
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
    setStock(product.stock?.toString() || "");
    setIsActive(product.isActive ? "true" : "false");
    setEditingId(product._id);
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      setMessage("Error: Ingrese un precio válido");
      setLoading(false);
      return;
    }

    if (
      compareAtPrice &&
      (isNaN(parseFloat(compareAtPrice)) || parseFloat(compareAtPrice) <= 0)
    ) {
      setMessage("Error: Precio de comparación inválido");
      setLoading(false);
      return;
    }

    if (stock && (isNaN(parseInt(stock)) || parseInt(stock) < 0)) {
      setMessage("Error: Stock inválido");
      setLoading(false);
      return;
    }

    try {
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
        stock: stock ? parseInt(stock) : 0,
        isActive: isActive === "true",
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
        setOpen(false);
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

  const filteredProducts = products.filter((p) =>
    [p.name, p.sku].some((field) =>
      field?.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <main className="pt-[50px] min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6">Gestión de Productos</h1>

      {/* Botón + Modal */}
      <div className="flex justify-end mb-4">
        <Dialog
          open={open}
          onOpenChange={(val) => {
            if (!val) resetForm();
            setOpen(val);
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => setOpen(true)}>Agregar Producto</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Editar Producto" : "Agregar Producto"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombre y Categoría */}
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

              {/* Precio y Comparación */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Precio *</Label>
                  <Input
                    id="price"
                    type="text"
                    inputMode="decimal"
                    value={price}
                    onChange={(e) =>
                      setPrice(e.target.value.replace(/[^0-9.]/g, ""))
                    }
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="compareAtPrice">Precio de comparación</Label>
                  <Input
                    id="compareAtPrice"
                    type="text"
                    inputMode="decimal"
                    value={compareAtPrice}
                    onChange={(e) =>
                      setCompareAtPrice(e.target.value.replace(/[^0-9.]/g, ""))
                    }
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Marca, SKU y Stock */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Marca</Label>
                  <Input
                    id="brand"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                  />
                </div>
              </div>

              {/* Estado */}
              <div className="space-y-2">
                <Label htmlFor="isActive">Estado</Label>
                <Select value={isActive} onValueChange={setIsActive}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Activo</SelectItem>
                    <SelectItem value="false">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Descripción */}
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

              {/* Imágenes */}
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Imagen principal *</Label>
                <Input
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="images">Imágenes adicionales</Label>
                <Textarea
                  id="images"
                  placeholder="https://img1.jpg, https://img2.jpg"
                  value={imagesInput}
                  onChange={(e) => setImagesInput(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading
                    ? "Guardando..."
                    : editingId
                    ? "Actualizar"
                    : "Agregar"}
                </Button>
              </div>
              {message && (
                <p className="mt-2 text-center text-sm font-medium">
                  {message}
                </p>
              )}
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Listado profesional */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Lista de Productos ({filteredProducts.length})</CardTitle>
          <Input
            placeholder="Buscar por nombre o SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <p className="text-gray-500">No se encontraron productos</p>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Imagen</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Marca</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((p) => (
                    <TableRow key={p._id}>
                      <TableCell>
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="h-12 w-12 object-cover rounded"
                          />
                        ) : (
                          <div className="h-12 w-12 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
                            N/A
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900">
                            ${p.price.toFixed(2)}
                          </span>
                          {p.compareAtPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              ${p.compareAtPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {p.stock !== undefined ? (
                          p.stock > 5 ? (
                            <Badge
                              variant="outline"
                              className="bg-green-100 text-green-700"
                            >
                              {p.stock} en stock
                            </Badge>
                          ) : p.stock > 0 ? (
                            <Badge
                              variant="outline"
                              className="bg-yellow-100 text-yellow-700"
                            >
                              Bajo stock ({p.stock})
                            </Badge>
                          ) : (
                            <Badge variant="destructive">Sin stock</Badge>
                          )
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {p.isActive ? (
                          <Badge className="bg-green-600">Activo</Badge>
                        ) : (
                          <Badge variant="secondary">Inactivo</Badge>
                        )}
                      </TableCell>
                      <TableCell>{p.category || "-"}</TableCell>
                      <TableCell>{p.brand || "-"}</TableCell>
                      <TableCell>{p.sku || "-"}</TableCell>
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
