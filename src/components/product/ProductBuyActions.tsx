"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { IProduct } from "@/models/Product";
import { useCartStore } from "@/store/useCartStore";
import AuthModal from "@/components/auth/AuthModal";

interface ProductBuyActionsProps {
  product: IProduct;
}

export default function ProductBuyActions({ product }: ProductBuyActionsProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const addToCart = useCartStore((state) => state.addToCart);
  const [authOpen, setAuthOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log(
      "[ProductBuyActions] Estado de sesión:",
      status,
      session?.user?.email
    );
  }, [status, session]);

  const handleBuy = async () => {
    console.log("[ProductBuyActions] Click en Comprar ahora");
    setIsLoading(true);

    // Si la sesión aún está cargando, esperamos
    if (status === "loading") {
      console.log("[ProductBuyActions] Esperando verificación de sesión...");
      setIsLoading(false);
      return;
    }

    // Si el usuario está autenticado
    if (status === "authenticated" && session?.user) {
      console.log(
        "[ProductBuyActions] Usuario autenticado, agregando al carrito y redirigiendo a /order"
      );

      addToCart({
        id: String(product._id),
        name: product.name,
        price: product.price,
        image: product.imageUrl,
        quantity: 1,
      });

      router.push("/order");
      setIsLoading(false);
      return;
    }

    // Si el usuario no está autenticado
    console.log(
      "[ProductBuyActions] Usuario no autenticado, abriendo modal de autenticación"
    );
    setAuthOpen(true);
    setIsLoading(false);
  };

  const handleAuthSuccess = () => {
    console.log(
      "[ProductBuyActions] Autenticación exitosa, agregando producto al carrito"
    );

    addToCart({
      id: String(product._id),
      name: product.name,
      price: product.price,
      image: product.imageUrl,
      quantity: 1,
    });

    router.push("/order");
  };

  return (
    <>
      <div className="flex flex-col gap-3 mt-4">
        <Button
          onClick={handleBuy}
          disabled={isLoading}
          className="w-full bg-[#1E3A8A] hover:bg-[#1E40AF] text-white text-lg py-6 rounded-lg shadow-md transition-all disabled:opacity-50"
        >
          {isLoading ? "Procesando..." : "agregar al carrito"}
        </Button>
      </div>

      <AuthModal
        open={authOpen}
        onOpenChange={setAuthOpen}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  );
}
