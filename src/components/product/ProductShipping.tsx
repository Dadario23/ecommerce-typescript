"use client";
import { Truck, Store } from "lucide-react";

export default function ProductShipping() {
  return (
    <div className="border rounded-lg p-4 mt-6 space-y-2 bg-gray-50">
      <div className="flex items-center gap-2">
        <Truck size={18} />
        <p>Envío gratis a todo el país</p>
      </div>
      <div className="flex items-center gap-2">
        <Store size={18} />
        <p>Retiro gratis en sucursal</p>
      </div>
    </div>
  );
}
