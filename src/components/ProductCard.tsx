"use client";

import { Button } from "@/components/ui/button";
import { IProduct } from "@/models/Product";
import { useCartUI } from "@/store/useCartUI"; // ✅ usamos el store real
import { useCartStore } from "@/store/useCartStore";
interface ProductBuyActionsProps {
  product: IProduct;
}

export default function ProductBuyActions({ product }: ProductBuyActionsProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const openCart = useCartUI((state) => state.open);

  const handleBuy = () => {
    addToCart({
      id: String(product._id),
      name: product.name,
      price: product.price,
      image: product.imageUrl,
      quantity: 1,
    });

    openCart(); // ✅ abrimos el Drawer al comprar
  };

  return (
    <div className="flex flex-col gap-3 mt-4">
      <Button
        onClick={handleBuy}
        className="w-full bg-[#1E3A8A] hover:bg-[#1E40AF] text-white text-lg py-6 rounded-lg shadow-md transition-all"
      >
        Comprar
      </Button>
    </div>
  );
}
