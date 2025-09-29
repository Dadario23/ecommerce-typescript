"use client";
import { Truck, Store, CreditCard, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProductShipping() {
  return (
    <div className="space-y-6">
      {/* Botones de compra */}
      {/* <div className="flex flex-col sm:flex-row gap-3">
        <Button
          size="lg"
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3"
        >
          Comprar ahora
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold py-3"
        >
          Agregar al carrito
        </Button>
      </div> */}

      {/* Información de contacto */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
        <p className="text-sm text-gray-700 mb-2">
          Consulte disponibilidad o reposición
        </p>
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-900">
            4127 9999 - Venta Telefónica
          </p>
          <p className="text-sm font-medium text-blue-600">
            contacto@rodo.com.ar
          </p>
        </div>
      </div>

      {/* Envíos y retiros */}
      <div className="border rounded-lg p-4 space-y-3 bg-gray-50">
        <h3 className="font-semibold text-gray-900">Envíos a AMBA</h3>

        <div className="flex items-start gap-3">
          <Truck size={18} className="text-green-600 mt-0.5" />
          <div>
            <p className="font-medium text-gray-900">
              Envío gratis a todo el país
            </p>
            <p className="text-sm text-gray-600">
              Despacho en 24-48 horas hábiles
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Store size={18} className="text-green-600 mt-0.5" />
          <div>
            <p className="font-medium text-gray-900">
              Retiro gratis en sucursal
            </p>
            <p className="text-sm text-gray-600">Disponible en 3 horas</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <CreditCard size={18} className="text-green-600 mt-0.5" />
          <div>
            <p className="font-medium text-gray-900">
              Conoce las cuotas con tu tarjeta
            </p>
            <p className="text-sm text-blue-600 flex items-center gap-1">
              Ver más <span className="text-lg">😊</span>
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Shield size={18} className="text-green-600 mt-0.5" />
          <div>
            <p className="font-medium text-gray-900">Compra protegida</p>
            <p className="text-sm text-gray-600">Garantía de 12 meses</p>
          </div>
        </div>
      </div>
    </div>
  );
}
