"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Truck, Mail } from "lucide-react";

interface OrderData {
  orderNumber: string;
  orderId: string;
  total: number;
  createdAt: string;
  itemsCount: number;
}

export default function OrderSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Obtener datos reales de la orden
  useEffect(() => {
    const orderId = searchParams.get("orderId");

    if (orderId) {
      fetchOrderData(orderId);
    } else {
      // Si no hay orderId, usar datos básicos
      setOrderData({
        orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
        orderId: "temp",
        total: 0,
        createdAt: new Date().toLocaleDateString(),
        itemsCount: 0,
      });
      setIsLoading(false);
    }
  }, [searchParams]);

  const fetchOrderData = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (res.ok) {
        const order = await res.json();
        setOrderData({
          orderNumber: order.orderNumber,
          orderId: order._id,
          total: order.total,
          createdAt: new Date(order.createdAt).toLocaleDateString(),
          itemsCount: order.items.length,
        });
      }
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Redirigir después de 10 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/");
    }, 90000);

    return () => clearTimeout(timer);
  }, [router]);

  const handleContinueShopping = () => {
    router.push("/");
  };

  const handleViewOrders = () => {
    router.push("/account/orders");
  };

  if (isLoading) {
    return (
      <div className="pt-[140px] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Cargando información de tu pedido...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-[140px] min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container max-w-2xl mx-auto px-4">
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <CardTitle className="text-3xl font-bold text-green-800">
              ¡Pedido Confirmado!
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Tu pedido ha sido procesado exitosamente
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Información del pedido */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">
                Resumen de tu pedido
              </h3>
              <div className="space-y-1 text-sm text-green-700">
                <p>
                  • Número de pedido: {orderData?.orderNumber || "Cargando..."}
                </p>
                <p>
                  • Fecha:{" "}
                  {orderData?.createdAt || new Date().toLocaleDateString()}
                </p>
                <p>• Total: ${orderData?.total?.toLocaleString() || "0"}</p>
                <p>• Productos: {orderData?.itemsCount || 0} item(s)</p>
                <p>• Estado: Confirmado</p>
                <p>• Recibirás un email con los detalles</p>
              </div>
            </div>

            {/* Timeline de entrega */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-4 flex items-center">
                <Truck className="w-5 h-5 mr-2" />
                Proceso de entrega
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm">Pedido confirmado</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm">Preparando envío</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                    <Truck className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm">En camino</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm">Entregado</span>
                </div>
              </div>
            </div>

            {/* Contacto de soporte */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                ¿Necesitas ayuda?
              </h3>
              <p className="text-sm text-gray-700">
                Contacta a nuestro equipo de soporte:{" "}
                <a
                  href="mailto:soporte@tienda.com"
                  className="text-blue-600 hover:underline"
                >
                  soporte@tienda.com
                </a>
                <br />
                <span className="text-xs">
                  Horario: Lunes a Viernes 9:00 - 18:00
                </span>
              </p>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={handleContinueShopping}
                className="flex-1 bg-green-600 hover:bg-green-700"
                size="lg"
              >
                Seguir Comprando
              </Button>
              <Button
                onClick={handleViewOrders}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                Ver Mis Pedidos
              </Button>
            </div>

            {/* Mensaje adicional */}
            <p className="text-center text-xs text-gray-500 pt-4">
              Serás redirigido automáticamente a la página principal en 10
              segundos
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
