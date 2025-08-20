"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ZoomIn, X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  images: string[];
  productName: string;
}

// 👇 Tipamos explícitamente el componente
const ImageGallery: React.FC<ImageGalleryProps> = ({ images, productName }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-400">Sin imagen</p>
      </div>
    );
  }

  const selectedImage = images[selectedIndex];

  const nextImage = () =>
    setSelectedIndex((prev) => (prev + 1) % images.length);
  const prevImage = () =>
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="space-y-4">
      {/* Imagen principal */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
        <img
          src={selectedImage}
          alt={productName}
          className={cn(
            "w-full h-full object-contain transition-transform duration-300 cursor-zoom-in",
            isZoomed && "scale-150"
          )}
          onClick={() => setIsZoomed(!isZoomed)}
        />

        {/* Controles de navegación */}
        {images.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
                setIsZoomed(false);
              }}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
                setIsZoomed(false);
              }}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </>
        )}

        {/* Indicador de imagen actual */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-2 py-1 rounded text-xs">
            {selectedIndex + 1} / {images.length}
          </div>
        )}

        {/* Botón de zoom */}
        {!isZoomed && (
          <Button
            variant="secondary"
            size="icon"
            className="absolute bottom-2 right-2 bg-white/80 hover:bg-white"
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomed(true);
            }}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        )}

        {/* Botón salir del zoom */}
        {isZoomed && (
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white"
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomed(false);
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Miniaturas */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((img, index) => (
            <button
              key={index}
              className={cn(
                "w-16 h-16 border-2 rounded-md overflow-hidden flex-shrink-0 transition-all",
                selectedIndex === index
                  ? "border-blue-500"
                  : "border-gray-200 hover:border-gray-300"
              )}
              onClick={() => {
                setSelectedIndex(index);
                setIsZoomed(false);
              }}
            >
              <img
                src={img}
                alt={`${productName} ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
