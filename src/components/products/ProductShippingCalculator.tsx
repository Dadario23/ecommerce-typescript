"use client";

import { useEffect, useState } from "react";
import { Truck, Zap, Globe, ChevronDown, Clock, MessageCircle } from "lucide-react";

interface ShippingZone {
  id: string;
  name: string;
  localities: string[];
  flex: number;
  standard: number;
}

interface Props {
  shippingTypes: string[];
}

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5491150610043";

export default function ProductShippingCalculator({ shippingTypes }: Props) {
  const [zones, setZones]             = useState<ShippingZone[]>([]);
  const [selectedLocality, setSelected] = useState("");
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    fetch("/api/shipping/zones")
      .then((r) => r.json())
      .then((data) => setZones(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Flat list: { locality, zone }
  const allLocalities = zones.flatMap((z) =>
    z.localities.map((l) => ({ locality: l, zone: z })),
  );

  const match = allLocalities.find((e) => e.locality === selectedLocality);
  const zone  = match?.zone ?? null;

  const hasFlex     = shippingTypes.includes("flex");
  const hasStandard = shippingTypes.includes("standard");
  const hasNational = shippingTypes.includes("national");

  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50">
        <Truck className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-semibold text-gray-700">Opciones de envío</span>
      </div>

      <div className="p-4 space-y-4">
        {/* Selector de localidad */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1.5 block">
            Seleccioná tu localidad
          </label>
          <div className="relative">
            <select
              value={selectedLocality}
              onChange={(e) => setSelected(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 bg-white"
              disabled={loading}
            >
              <option value="">
                {loading ? "Cargando localidades..." : "— Elegí tu localidad —"}
              </option>
              {zones.map((z) => (
                <optgroup key={z.id} label={z.name}>
                  {z.localities.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </optgroup>
              ))}
              <optgroup label="Interior del país">
                <option value="interior">Interior del país</option>
              </optgroup>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Resultados AMBA */}
        {zone && (
          <div className="space-y-2">
            {hasFlex && (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Envío flex</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Mismo día / día siguiente
                    </p>
                  </div>
                </div>
                <span className="text-sm font-bold text-green-700">
                  ${zone.flex.toLocaleString("es-AR")}
                </span>
              </div>
            )}

            {hasStandard && (
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                    <Truck className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Envío estándar</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      2-3 días hábiles
                    </p>
                  </div>
                </div>
                <span className="text-sm font-bold text-blue-700">
                  ${zone.standard.toLocaleString("es-AR")}
                </span>
              </div>
            )}

            {!hasFlex && !hasStandard && (
              <p className="text-sm text-gray-500 text-center py-2">
                Este producto no tiene envío disponible para tu zona.
              </p>
            )}
          </div>
        )}

        {/* Interior */}
        {selectedLocality === "interior" && (
          <div className="space-y-2">
            {hasNational ? (
              <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                    <Globe className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Correo Arg / Andreani / OCA</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      5-10 días hábiles
                    </p>
                  </div>
                </div>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-100 hover:bg-green-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Consultar
                </a>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-2">
                Este producto no tiene envío al interior disponible.
              </p>
            )}
          </div>
        )}

        {/* Estado inicial */}
        {!selectedLocality && !loading && (
          <div className="flex flex-wrap gap-2">
            {hasFlex && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1.5 rounded-full">
                <Zap className="w-3 h-3" /> Envío flex disponible
              </span>
            )}
            {hasStandard && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1.5 rounded-full">
                <Truck className="w-3 h-3" /> Envío estándar disponible
              </span>
            )}
            {hasNational && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1.5 rounded-full">
                <Globe className="w-3 h-3" /> Envío al interior
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
