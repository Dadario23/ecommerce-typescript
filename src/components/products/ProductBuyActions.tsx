"use client";

import { useState } from "react";
import { ShoppingCart, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { IProduct } from "@/models/Product";
import { useCartStore } from "@/store/useCartStore";
import { useCartUI } from "@/store/useCartUI";
import { cn } from "@/lib/utils";

export default function ProductBuyActions({ product }: { product: IProduct }) {
  const addToCart = useCartStore((s) => s.addToCart);
  const openCart = useCartUI((s) => s.open);
  const router = useRouter();

  const [added, setAdded] = useState(false);
  const isOutOfStock = (product.stock ?? 0) <= 0;

  const cartPayload = {
    id: String(product._id),
    name: product.name,
    price: product.price,
    image: product.images?.[0] ?? "",
    quantity: 1,
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(cartPayload);
    setAdded(true);
    openCart();
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(cartPayload);
    router.push("/checkout");
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Add to cart */}
      <button
        onClick={handleAddToCart}
        disabled={isOutOfStock}
        className={cn(
          "flex items-center justify-center gap-2 w-full py-3.5 rounded-xl border-2 font-semibold text-base transition-all",
          isOutOfStock
            ? "border-gray-200 text-gray-400 cursor-not-allowed"
            : added
            ? "border-green-500 bg-green-50 text-green-700"
            : "border-[#1E3A8A] text-[#1E3A8A] hover:bg-[#1E3A8A] hover:text-white"
        )}
      >
        <ShoppingCart className="w-5 h-5" />
        {added ? "¡Agregado!" : "Agregar al carrito"}
      </button>

      {/* Buy now */}
      <button
        onClick={handleBuyNow}
        disabled={isOutOfStock}
        className={cn(
          "flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-base transition-all",
          isOutOfStock
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-[#1E3A8A] hover:bg-[#1e40af] text-white shadow-md hover:shadow-lg"
        )}
      >
        <Zap className="w-5 h-5" />
        Comprar ahora
      </button>

      {isOutOfStock && (
        <p className="text-center text-sm text-red-500">
          Este producto no tiene stock disponible
        </p>
      )}
    </div>
  );
}
