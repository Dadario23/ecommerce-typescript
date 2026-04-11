"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { IProduct } from "@/models/Product";
import { useCartStore } from "@/store/useCartStore";
import { useCartUI } from "@/store/useCartUI"; // ✅ Importamos el store del UI del carrito

interface ProductBuyActionsProps {
  product: IProduct;
}

export default function ProductBuyActions({ product }: ProductBuyActionsProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const openCart = useCartUI((state) => state.open); // ✅ Función para abrir el carrito
  const [isLoading, setIsLoading] = useState(false);

  const handleBuy = () => {
    const mainImage = product.images?.[0] || "";

    addToCart({
      id: String(product._id),
      name: product.name,
      price: product.price,
      image: mainImage,
      quantity: 1,
    });

    openCart();
  };

  return (
    <div className="flex flex-col gap-3 mt-4">
      <Button
        onClick={handleBuy}
        disabled={isLoading}
        className="w-full bg-[#1E3A8A] hover:bg-[#1E40AF] text-white text-lg py-6 rounded-lg shadow-md transition-all disabled:opacity-50"
      >
        {isLoading ? "Procesando..." : "Comprar ahora"}
      </Button>
    </div>
  );
}
