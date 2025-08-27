"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";
import { useCartUI } from "@/store/useCartUI";
import { Trash2 } from "lucide-react";
import AuthModal from "@/components/auth/AuthModal"; // ✅ Importamos el AuthModal

export default function CartDrawer() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const items = useCartStore((state) => state.items);
  const { isOpen, close } = useCartUI();
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  // ✅ Estado para controlar el modal de autenticación
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const handleCheckout = () => {
    console.log("[CartDrawer] Click en Finalizar pedido");
    console.log("[CartDrawer] Estado de sesión:", status);

    // ✅ Verificamos autenticación al finalizar pedido
    if (status === "authenticated") {
      console.log("[CartDrawer] Usuario autenticado, redirigiendo a /order");
      close();
      router.push("/order");
    } else {
      console.log(
        "[CartDrawer] Usuario no autenticado, abriendo modal de auth"
      );
      setAuthModalOpen(true);
    }
  };

  // ✅ Cerrar auth modal cuando se autentica
  useEffect(() => {
    if (authModalOpen && status === "authenticated") {
      console.log(
        "[CartDrawer] Usuario autenticado, cerrando modal y redirigiendo"
      );
      setAuthModalOpen(false);
      close();
      router.push("/order");
    }
  }, [authModalOpen, status, close, router]);

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => (!open ? close() : null)}>
        <SheetContent
          side="right"
          className="w-[400px] sm:w-[480px] p-0 flex flex-col"
        >
          {/* Header */}
          <SheetHeader className="border-b px-6 py-4">
            <SheetTitle className="text-lg font-bold">Tu carrito</SheetTitle>
            <SheetDescription className="text-sm text-gray-500">
              Revisa tus productos antes de finalizar tu compra
            </SheetDescription>
          </SheetHeader>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {items.length === 0 ? (
              <p className="text-gray-500 text-center mt-6">Carrito vacío</p>
            ) : (
              <ul className="space-y-4">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-4 border-b pb-4"
                  >
                    {/* Imagen */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded border"
                    />

                    {/* Info */}
                    <div className="flex-1">
                      <h3 className="text-sm font-medium line-clamp-2">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                        {/* Selector de cantidad */}
                        <select
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(item.id, Number(e.target.value))
                          }
                          className="border rounded px-2 py-1 text-sm"
                        >
                          {Array.from({ length: 10 }).map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {i + 1}
                            </option>
                          ))}
                        </select>

                        {/* Precio */}
                        <span className="font-semibold text-sm">
                          ${(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Botón eliminar */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-red-500 transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          <SheetFooter className="border-t px-6 py-4 space-y-3">
            {items.length > 0 && (
              <>
                <div className="flex justify-between text-sm">
                  <span>{totalItems} artículos</span>
                  <span className="font-semibold">
                    ${totalPrice.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-lg font-bold">
                  <span>Total Productos</span>
                  <span>${totalPrice.toLocaleString()}</span>
                </div>

                <Button
                  onClick={handleCheckout}
                  className="w-full bg-[#1E3A8A] hover:bg-[#1E40AF] text-white py-6 text-base"
                  disabled={items.length === 0}
                >
                  Finalizar el pedido
                </Button>
              </>
            )}
            {items.length === 0 && (
              <Button
                className="w-full bg-gray-300 text-gray-600 cursor-not-allowed"
                disabled
              >
                Carrito vacío
              </Button>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* ✅ Modal de autenticación */}
      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        fromCart={true}
      />
    </>
  );
}
