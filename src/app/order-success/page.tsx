"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function OrderSuccessPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  // ✅ Generar datos solo en el cliente
  useEffect(() => {
    setOrderNumber(
      `#${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")}`
    );
    setCurrentDate(new Date().toLocaleDateString());
  }, []);

  // ✅ Redirigir después de 10 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/");
    }, 10000);

    return () => clearTimeout(timer);
  }, [router]);

  const handleContinueShopping = () => {
    router.push("/");
  };

  const handleViewOrders = () => {
    router.push("/account/orders");
  };

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
                <p>• Número de pedido: {orderNumber || "Cargando..."}</p>
                <p>• Fecha: {currentDate || "Cargando..."}</p>
                <p>• Estado: Confirmado</p>
                <p>• Recibirás un email con los detalles</p>
              </div>
            </div>

            {/* Pasos siguientes */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">
                ¿Qué sigue ahora?
              </h3>
              <ul className="space-y-1 text-sm text-blue-700 list-disc list-inside">
                <li>Recibirás un email de confirmación</li>
                <li>Procesaremos tu pedido en las próximas 24 horas</li>
                <li>Te enviaremos updates sobre el envío</li>
                <li>Tiempo estimado de entrega: 3-5 días hábiles</li>
              </ul>
            </div>

            {/* Contacto de soporte */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">
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
              </p>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={handleContinueShopping}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Seguir Comprando
              </Button>
              <Button
                onClick={handleViewOrders}
                variant="outline"
                className="flex-1"
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
