"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ImagePlus, X, Loader2, AlertCircle } from "lucide-react";

const INPUT =
  "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 placeholder:text-gray-300 transition-colors";

interface Category {
  name: string;
  description?: string;
  status: "published" | "draft";
  thumbnail?: string;
}

export default function EditarCategoriaPage() {
  const { id } = useParams();
  const router = useRouter();

  const [category, setCategory] = useState<Category | null>(null);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [newPreview, setNewPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/categories/${id}`)
      .then((r) => r.json())
      .then((data) => setCategory(data))
      .catch(() => setError("No se pudo cargar la categoría"))
      .finally(() => setFetching(false));
  }, [id]);

  useEffect(() => {
    return () => {
      if (newPreview) URL.revokeObjectURL(newPreview);
    };
  }, [newPreview]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (newPreview) URL.revokeObjectURL(newPreview);
    setNewFile(file);
    setNewPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const removeImage = () => {
    if (newPreview) URL.revokeObjectURL(newPreview);
    setNewFile(null);
    setNewPreview(null);
    setCategory((prev) => prev ? { ...prev, thumbnail: undefined } : prev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return;
    setError(null);

    if (!category.name.trim()) return setError("El nombre es obligatorio");
    if (category.name.trim().length < 3) return setError("El nombre debe tener al menos 3 caracteres");

    setLoading(true);
    try {
      let thumbnailUrl = category.thumbnail;

      if (newFile) {
        const formData = new FormData();
        formData.append("file", newFile);
        const up = await fetch("/api/upload", { method: "POST", body: formData });
        if (!up.ok) throw new Error("Error al subir la imagen");
        const upData = await up.json();
        thumbnailUrl = upData.secure_url;
      }

      const res = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: category.name.trim(),
          description: category.description?.trim(),
          status: category.status,
          thumbnail: thumbnailUrl,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || err.error || "Error al actualizar la categoría");
      }

      router.push("/dashboard/categories");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const currentPreview = newPreview ?? category?.thumbnail ?? null;

  if (fetching) {
    return (
      <div className="bg-gray-50 min-h-screen p-6 md:p-8 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Cargando categoría...</span>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="bg-gray-50 min-h-screen p-6 md:p-8">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm text-red-500">{error || "Categoría no encontrada"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6 md:p-8">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/dashboard/categories"
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#1E3A8A] font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver a categorías
        </Link>

        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Editar categoría</h1>
          <p className="text-sm text-gray-400 mt-1">Modificá los campos y guardá los cambios</p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda: imagen + estado */}
          <div className="space-y-6">
            {/* Imagen */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Imagen</h2>
              {currentPreview ? (
                <div className="relative">
                  <img
                    src={currentPreview}
                    alt="Vista previa"
                    className="w-full aspect-square object-contain rounded-xl border border-gray-100 bg-gray-50 p-2"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <label className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-[#1E3A8A] cursor-pointer transition-colors">
                    <ImagePlus className="w-3.5 h-3.5" />
                    Cambiar imagen
                    <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
                  </label>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl p-8 cursor-pointer hover:border-blue-300 hover:bg-blue-50/40 transition-colors">
                  <ImagePlus className="w-7 h-7 text-gray-300" />
                  <span className="text-sm text-gray-400 text-center">Hacé clic para subir una imagen</span>
                  <span className="text-xs text-gray-300">JPG, PNG, WebP</span>
                  <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
                </label>
              )}
            </div>

            {/* Estado */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Estado</h2>
              <select
                value={category.status}
                onChange={(e) => setCategory({ ...category, status: e.target.value as "published" | "draft" })}
                className={INPUT}
              >
                <option value="published">Publicada</option>
                <option value="draft">Borrador</option>
              </select>
            </div>
          </div>

          {/* Columna derecha: info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Información</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                    Nombre <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={category.name}
                    onChange={(e) => setCategory({ ...category, name: e.target.value })}
                    placeholder="Ej: Celulares, Accesorios"
                    required
                    className={INPUT}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                    Descripción
                  </label>
                  <textarea
                    value={category.description ?? ""}
                    onChange={(e) => setCategory({ ...category, description: e.target.value })}
                    placeholder="Descripción breve de la categoría"
                    rows={5}
                    className={`${INPUT} resize-none`}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#1E3A8A] text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-800 transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
                ) : "Guardar cambios"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
