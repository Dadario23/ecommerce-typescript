// components/product/ImageGallery.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import clsx from "clsx";

export default function ImageGallery({ images }: { images: string[] }) {
  const [idx, setIdx] = useState(0);
  const current = images[idx] ?? images[0];

  return (
    <div className="w-full">
      {/* Imagen principal */}
      <div className="relative w-full aspect-[4/3] bg-white rounded-lg border overflow-hidden">
        {/* usa next/image para optimizar */}
        <Image
          src={current}
          alt="Producto"
          fill
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-contain"
          priority
        />
      </div>

      {/* Thumbnails */}
      <div className="mt-3 grid grid-cols-5 sm:grid-cols-6 gap-2">
        {images.map((src, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            aria-label={`Imagen ${i + 1}`}
            className={clsx(
              "relative aspect-square rounded border bg-white overflow-hidden",
              idx === i ? "ring-2 ring-indigo-500" : "hover:border-gray-300"
            )}
          >
            <Image
              src={src}
              alt={`Miniatura ${i + 1}`}
              fill
              sizes="80px"
              className="object-contain"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
