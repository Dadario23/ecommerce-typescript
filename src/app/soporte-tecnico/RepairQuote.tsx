"use client";

import { useState, useMemo } from "react";
import { MessageCircle, ChevronDown, Smartphone } from "lucide-react";
import type { RepairData } from "@/lib/repairSheets";

const WA_NUMBER = "5491150610043";

interface Props {
  data: RepairData;
}

export default function RepairQuote({ data }: Props) {
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [repairType, setRepairType] = useState("");

  const availableModels = useMemo(
    () => data.models.filter((m) => m.brand === brand).map((m) => m.model),
    [brand, data.models]
  );

  const availableRepairs = useMemo(
    () =>
      data.prices
        .filter((p) => p.brand === brand && p.model === model)
        .map((p) => ({ type: p.repairType, price: p.price })),
    [brand, model, data.prices]
  );

  const result = useMemo(
    () => availableRepairs.find((r) => r.type === repairType) ?? null,
    [repairType, availableRepairs]
  );

  function handleBrandChange(v: string) {
    setBrand(v);
    setModel("");
    setRepairType("");
  }

  function handleModelChange(v: string) {
    setModel(v);
    setRepairType("");
  }

  const waText = result
    ? `Hola! Quiero confirmar el presupuesto para mi ${brand} ${model} — ${repairType} ($${result.price.toLocaleString("es-AR")})`
    : `Hola! Quiero consultar sobre reparación de mi equipo.`;
  const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waText)}`;

  if (data.brands.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400">
        <Smartphone className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">El catálogo de precios no está disponible en este momento.</p>
        <a
          href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hola! Quiero consultar sobre reparación de mi equipo.")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 bg-[#25D366] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#20bd5a] transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          Consultar por WhatsApp
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Brand */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          1. Seleccioná la marca
        </label>
        <div className="relative">
          <select
            value={brand}
            onChange={(e) => handleBrandChange(e.target.value)}
            className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-colors"
          >
            <option value="">— Elegí una marca —</option>
            {data.brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Model */}
      {brand && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            2. Seleccioná el modelo
          </label>
          <div className="relative">
            <select
              value={model}
              onChange={(e) => handleModelChange(e.target.value)}
              className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] transition-colors"
            >
              <option value="">— Elegí un modelo —</option>
              {availableModels.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      )}

      {/* Repair type */}
      {model && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            3. ¿Qué necesita reparación?
          </label>
          {availableRepairs.length === 0 ? (
            <p className="text-sm text-gray-400 italic">
              No hay reparaciones cargadas para este modelo. Consultanos directamente.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableRepairs.map((r) => (
                <button
                  key={r.type}
                  onClick={() => setRepairType(r.type)}
                  className={`text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    repairType === r.type
                      ? "border-[#1E3A8A] bg-blue-50 text-[#1E3A8A] shadow-sm"
                      : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {r.type}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="bg-[#1E3A8A] rounded-2xl p-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-300 mb-1">
            Presupuesto estimado
          </p>
          <p className="text-4xl font-bold mb-1">
            ${result.price.toLocaleString("es-AR")}
          </p>
          <p className="text-sm text-blue-200 mb-5">
            {brand} {model} — {repairType}
          </p>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm px-5 py-3.5 rounded-xl transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Confirmar turno por WhatsApp
          </a>
        </div>
      )}

      {/* Always show WA fallback if no result yet */}
      {!result && (
        <p className="text-xs text-gray-400 text-center">
          ¿No encontrás tu equipo?{" "}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1E3A8A] font-medium hover:underline"
          >
            Consultanos por WhatsApp
          </a>
        </p>
      )}
    </div>
  );
}
