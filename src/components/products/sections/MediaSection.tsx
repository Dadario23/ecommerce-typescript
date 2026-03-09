"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import imageCompression from "browser-image-compression";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILES = 4;

interface ImageItem {
  id: string;
  file?: File;
  preview: string;
  existing?: boolean;
}

interface Props {
  product?: any;
  onImagesChange: (images: ImageItem[]) => void;
}

export default function MediaSection({ product, onImagesChange }: Props) {
  const [images, setImages] = useState<ImageItem[]>(
    product?.images?.map((url: string) => ({
      id: crypto.randomUUID(),
      preview: url,
      existing: true,
    })) || [],
  );

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onImagesChange(images);
  }, [images, onImagesChange]);

  // Cleanup global al desmontar
  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (!img.existing && img.preview.startsWith("blob:")) {
          URL.revokeObjectURL(img.preview);
        }
      });
    };
  }, [images]);

  const validateFiles = (files: File[]) => {
    if (images.length + files.length > MAX_FILES) {
      throw new Error(`Máximo ${MAX_FILES} imágenes`);
    }

    files.forEach((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error("Formato no permitido");
      }

      if (file.size > MAX_SIZE) {
        throw new Error("Cada imagen debe pesar menos de 5MB");
      }
    });
  };

  const handleFiles = async (fileList: FileList) => {
    try {
      setError(null);

      const files = Array.from(fileList);
      validateFiles(files);

      const newItems: ImageItem[] = [];

      for (const file of files) {
        const compressed = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1200,
          useWebWorker: true,
        });

        newItems.push({
          id: crypto.randomUUID(),
          file: compressed,
          preview: URL.createObjectURL(compressed),
        });
      }

      setImages((prev) => [...prev, ...newItems]);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const toRemove = prev[index];

      if (!toRemove.existing && toRemove.preview.startsWith("blob:")) {
        URL.revokeObjectURL(toRemove.preview);
      }

      return prev.filter((_, i) => i !== index);
    });
  };

  const handleReorder = (from: number, to: number) => {
    if (from === to) return;

    setImages((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      return updated;
    });
  };

  return (
    <Card className="rounded-2xl shadow-sm border">
      <CardHeader>
        <CardTitle>Media</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <Label>Product Images *</Label>

          <label className="mt-2 flex items-center justify-center border-2 border-dashed rounded-xl p-6 text-sm cursor-pointer hover:bg-gray-50">
            <span>Click para seleccionar imágenes</span>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                if (e.target.files) handleFiles(e.target.files);
                e.target.value = "";
              }}
              className="hidden"
            />
          </label>

          <p className="text-xs text-muted-foreground mt-2">
            Máximo {MAX_FILES} imágenes
          </p>

          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        </div>

        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            {images.map((img, i) => (
              <div
                key={img.id}
                draggable
                onDragStart={() => setDragIndex(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragIndex !== null) {
                    handleReorder(dragIndex, i);
                    setDragIndex(null);
                  }
                }}
                className="relative group cursor-move"
              >
                <img
                  src={img.preview}
                  alt="preview"
                  className="rounded-lg border object-cover h-28 w-full"
                />

                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
