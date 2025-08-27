"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartWithSession } from "@/hooks/useCartWithSession";
export default function PedidoPage() {
  const { items, clearCart } = useCartWithSession();
  const router = useRouter();

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Si procesas el pedido exitosamente, limpia el carrito
  const handleProcessOrder = async () => {
    try {
      // ... procesar pedido ...
      clearCart(); // 👈 Limpiar después del éxito
    } catch (error) {
      console.error("Error processing order:", error);
    }
  };

  if (items.length === 0) {
    return (
      <div className="pt-[120px] flex flex-col items-center justify-center">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Tu carrito está vacío 🛒
        </h2>
        <Button onClick={() => router.push("/")}>Volver a la tienda</Button>
      </div>
    );
  }

  return (
    <div className="pt-[120px] container max-w-3xl mx-auto">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Resumen de tu pedido
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Lista de productos */}
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border-b pb-3"
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-16 rounded overflow-hidden">
                    <Image
                      src={item.image || "/placeholder.png"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} x ${item.price.toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="font-medium">
                  ${(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <Separator />

          {/* Total */}
          <div className="flex justify-between text-lg font-semibold">
            <span>Total:</span>
            <span>${total.toLocaleString()}</span>
          </div>

          {/* Botón para continuar */}
          <Button className="w-full" onClick={() => router.push("/checkout")}>
            Continuar al Checkout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
