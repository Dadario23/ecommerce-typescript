"use client";

import { useEffect, useState } from "react";
import { Truck, Zap, Globe, ChevronDown, Clock, MessageCircle, User } from "lucide-react";
import Link from "next/link";
import { useShippingZone } from "@/hooks/useShippingZone";

interface ShippingZone {
  id: string;
  name: string;
  localities: string[];
  flex: number;
  standard: number;
}

interface Props {
  shippingTypes: string[];
  freeShipping?: boolean;
}

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5491150610043";

function isBeforeNoon() { return new Date().getHours() < 12; }

export default function ProductShippingCalculator({ shippingTypes, freeShipping = false }: Props) {
  const [zones, setZones]               = useState<ShippingZone[]>([]);
  const [selectedLocality, setSelected] = useState("");
  const [zonesLoading, setZonesLoading] = useState(true);
  const detectedZone = useShippingZone();

  useEffect(() => {
    fetch("/api/shipping/zones")
      .then((r) => r.json())
      .then((data) => setZones(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setZonesLoading(false));
  }, []);

  // Pre-seleccionar localidad de la zona detectada
  useEffect(() => {
    if (!detectedZone.loading && detectedZone.zone && !selectedLocality) {
      setSelected(detectedZone.zone.localities[0] ?? "");
    }
  }, [detectedZone.loading, detectedZone.zone, selectedLocality]);

  const loading = zonesLoading || detectedZone.loading;

  const allLocalities = zones.flatMap((z) => z.localities.map((l) => ({ locality: l, zone: z })));
  const match = allLocalities.find((e) => e.locality === selectedLocality);
  const zone  = match?.zone ?? null;

  const hasFlex     = shippingTypes.includes("flex");
  const hasStandard = shippingTypes.includes("standard");
  const hasNational = shippingTypes.includes("national");
  const today       = isBeforeNoon();

  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50">
        <Truck className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-semibold text-gray-700">Opciones de envío</span>
        {detectedZone.source === "profile" && (
          <span className="ml-auto text-[10px] text-gray-400">Según tu dirección</span>
        )}
        {detectedZone.source === "ip" && (
          <span className="ml-auto text-[10px] text-gray-400">Ubicación aproximada</span>
        )}
      </div>

      <div className="p-4 space-y-4">

        {/* Prompt login si no está logueado */}
        {(detectedZone.source === "unknown" || detectedZone.source === null) && !loading && (
          <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
            <User className="w-4 h-4 text-blue-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-blue-800">Iniciá sesión para ver el costo exacto</p>
              <p className="text-[11px] text-blue-600">Calculamos el envío según tu domicilio registrado</p>
            </div>
            <Link href="/login" className="text-xs font-bold text-white bg-[#1E3A8A] px-3 py-1.5 rounded-lg hover:bg-blue-800 transition-colors shrink-0">
              Ingresar
            </Link>
          </div>
        )}

        {/* Prompt sin dirección */}
        {detectedZone.source === "no-address" && !loading && (
          <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-100 rounded-xl">
            <User className="w-4 h-4 text-yellow-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-yellow-800">Agregá tu domicilio para ver los envíos</p>
            </div>
            <Link href="/account/addresses" className="text-xs font-bold text-yellow-800 bg-yellow-200 px-3 py-1.5 rounded-lg hover:bg-yellow-300 transition-colors shrink-0">
              Agregar
            </Link>
          </div>
        )}

        {/* Selector de localidad */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1.5 block">
            {detectedZone.zone ? "Tu zona detectada · podés cambiarla" : "Seleccioná tu localidad"}
          </label>
          <div className="relative">
            <select
              value={selectedLocality}
              onChange={(e) => setSelected(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 bg-white"
              disabled={loading}
            >
              <option value="">{loading ? "Detectando zona..." : "— Elegí tu localidad —"}</option>
              {zones.map((z) => (
                <optgroup key={z.id} label={z.name}>
                  {z.localities.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
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

        {/* Envío gratis */}
        {zone && freeShipping && (
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-300 rounded-xl">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-green-800">{today ? "Llega gratis hoy" : "Llega gratis mañana"}</p>
                <p className="text-xs text-green-600">Envío sin cargo incluido</p>
              </div>
            </div>
            <span className="text-sm font-bold text-green-700">GRATIS</span>
          </div>
        )}

        {/* Opciones AMBA con costo */}
        {zone && !freeShipping && (
          <div className="space-y-2">
            {hasFlex && (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{today ? "Llega hoy" : "Llega mañana"}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Envío flex · mismo día / día siguiente
                    </p>
                  </div>
                </div>
                <span className="text-sm font-bold text-green-700">${zone.flex.toLocaleString("es-AR")}</span>
              </div>
            )}
            {hasStandard && (
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                    <Truck className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Llega en 2-3 días hábiles</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Envío estándar
                    </p>
                  </div>
                </div>
                <span className="text-sm font-bold text-blue-700">${zone.standard.toLocaleString("es-AR")}</span>
              </div>
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
                    <p className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" /> 5-10 días hábiles</p>
                  </div>
                </div>
                <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-100 hover:bg-green-200 px-3 py-1.5 rounded-lg transition-colors">
                  <MessageCircle className="w-3.5 h-3.5" /> Consultar
                </a>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-2">Este producto no tiene envío al interior disponible.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
