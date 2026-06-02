"use client";

import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useFavoritesStore } from "@/store/useFavoritesStore";

interface Props {
  productId: string;
  className?: string;
}

export default function FavoriteButton({ productId, className = "" }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const { isFavorited, toggle } = useFavoritesStore();
  const favorited = isFavorited(productId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      router.push("/login");
      return;
    }

    // Optimistic update
    toggle(productId);

    try {
      await fetch("/api/user/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
    } catch {
      // Revertir si falla
      toggle(productId);
    }
  };

  return (
    <button
      onClick={handleClick}
      aria-label={favorited ? "Quitar de favoritos" : "Agregar a favoritos"}
      className={`p-1.5 rounded-full transition-all ${
        favorited
          ? "bg-red-50 text-red-500"
          : "bg-white/80 text-gray-400 hover:text-red-400 hover:bg-red-50"
      } ${className}`}
    >
      <Heart
        className="w-4 h-4"
        fill={favorited ? "currentColor" : "none"}
        strokeWidth={2}
      />
    </button>
  );
}
