// app/account/addresses/page.tsx
"use client";

import { useState } from "react";

export default function AddressesPage() {
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      name: "Casa",
      street: "Av. Siempre Viva 742",
      city: "Springfield",
      province: "Buenos Aires",
      zipCode: "1234",
      isDefault: true,
    },
    {
      id: 2,
      name: "Trabajo",
      street: "Calle Falsa 123",
      city: "Ciudad",
      province: "Buenos Aires",
      zipCode: "5678",
      isDefault: false,
    },
  ]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Tus direcciones</h3>
        <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">
          Agregar nueva dirección
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {addresses.map((address) => (
          <div key={address.id} className="border rounded-lg p-4 relative">
            {address.isDefault && (
              <span className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                Principal
              </span>
            )}

            <h4 className="font-semibold mb-2">{address.name}</h4>
            <p className="text-gray-600 mb-1">{address.street}</p>
            <p className="text-gray-600 mb-1">
              {address.city}, {address.province} {address.zipCode}
            </p>

            <div className="mt-4 flex space-x-2">
              <button className="text-sm text-blue-600 hover:text-blue-800">
                Editar
              </button>
              <button className="text-sm text-red-600 hover:text-red-800">
                Eliminar
              </button>
              {!address.isDefault && (
                <button className="text-sm text-green-600 hover:text-green-800">
                  Establecer como principal
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
