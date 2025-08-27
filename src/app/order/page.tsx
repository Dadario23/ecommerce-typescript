"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/useCartStore"; // ✅ Usamos el store directo
import { useSession } from "next-auth/react";

// ✅ Interfaz para los items del carrito
interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export default function PedidoPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  // ✅ Estado para manejar carga y evitar errores con items undefined
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // ✅ Verificar autenticación
    if (status === "unauthenticated") {
      console.log("[PedidoPage] Usuario no autenticado, redirigiendo");
      router.push("/");
      return;
    }

    // ✅ Una vez que sabemos el estado de autenticación y tenemos items
    if (status !== "loading") {
      setIsLoading(false);
    }
  }, [status, router]);

  // ✅ Calcular total de manera segura
  const total =
    items?.reduce(
      (sum: number, item: CartItem) => sum + item.price * item.quantity,
      0
    ) || 0;

  // ✅ Si procesas el pedido exitosamente, limpia el carrito
  const handleProcessOrder = async () => {
    try {
      // ... procesar pedido ...
      /*  clearCart(); // 👈 Limpiar después del éxito */
      router.push("/checkout"); // o donde quieras redirigir
    } catch (error) {
      console.error("Error processing order:", error);
    }
  };

  // ✅ Mostrar loading mientras verificamos autenticación
  if (status === "loading" || isLoading) {
    return (
      <div className="pt-[120px] flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Cargando...
        </h2>
      </div>
    );
  }

  // ✅ Verificar si no hay items o items es undefined
  if (!items || items.length === 0) {
    return (
      <div className="pt-[120px] flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Tu carrito está vacío 🛒
        </h2>
        <Button onClick={() => router.push("/")}>Volver a la tienda</Button>
      </div>
    );
  }

  return (
    <div className="pt-[120px] container max-w-3xl mx-auto pb-8">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Resumen de tu pedido
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Lista de productos */}
          <div className="space-y-4">
            {items.map((item: CartItem) => (
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
                      sizes="64px"
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

          {/* Información del usuario */}
          <div className="bg-blue-50 p-4 rounded-md">
            <h3 className="font-semibold text-blue-800 mb-2">
              Información de envío
            </h3>
            <p className="text-sm text-blue-700">
              {session?.user?.name && `Nombre: ${session.user.name}`}
              {session?.user?.email && ` | Email: ${session.user.email}`}
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push("/")}
            >
              Seguir comprando
            </Button>
            <Button
              className="flex-1 bg-[#1E3A8A] hover:bg-[#1E40AF]"
              onClick={handleProcessOrder}
            >
              Confirmar pedido
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
