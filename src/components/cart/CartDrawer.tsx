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
import AuthModal from "@/components/auth/AuthModal";

export default function CartDrawer() {
  const router = useRouter();
  const { status } = useSession();
  const { isOpen, close } = useCartUI();

  const items = useCartStore((state) => state.items);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  const [authModalOpen, setAuthModalOpen] = useState(false);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const handleCheckout = () => {
    if (status === "authenticated") {
      close();
      router.push("/order");
    } else {
      setAuthModalOpen(true);
    }
  };

  // ✅ Sync con backend al eliminar un producto
  const handleRemoveItem = async (id: string) => {
    removeFromCart(id); // ✅ siempre actualizamos el estado local (Zustand)

    if (status !== "authenticated") {
      // 🚫 No intentamos hablar con el backend
      return;
    }

    try {
      const res = await fetch(`/api/cart/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (!data.success) {
        console.error("Error al eliminar en backend:", data.error);
      }
    } catch (err) {
      console.error("Error al sincronizar carrito:", err);
    }
  };

  useEffect(() => {
    if (authModalOpen && status === "authenticated") {
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
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded border"
                    />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium line-clamp-2">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center border rounded-md">
                          {/* Botón - */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-none"
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                Math.max(1, item.quantity - 1)
                              )
                            }
                          >
                            –
                          </Button>

                          {/* Cantidad */}
                          <span className="w-8 text-center text-sm">
                            {item.quantity}
                          </span>

                          {/* Botón + */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-none"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                          >
                            +
                          </Button>
                        </div>

                        {/* Precio del producto */}
                        <span className="font-semibold text-sm">
                          ${(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
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

                {/* Botón único */}
                <Button
                  onClick={handleCheckout}
                  className="w-full bg-[#1E3A8A] hover:bg-[#1E40AF] text-white py-6 text-base"
                  disabled={items.length === 0}
                >
                  Finalizar pedido
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

      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        fromCart={true}
      />
    </>
  );
}
