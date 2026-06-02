"use client";

import { useEffect, useState } from "react";
import { Truck, Zap, Save, RotateCcw, MapPin, Plus, X } from "lucide-react";

interface ZipRange {
  min: number;
  max: number;
}

interface Zone {
  id: string;
  name: string;
  localities: string[];
  zipRanges: ZipRange[];
  flex: number;
  standard: number;
}

export default function ShippingSettingsPage() {
  const [zones, setZones]     = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => {
    fetch("/api/shipping/zones")
      .then((r) => r.json())
      .then((data) =>
        setZones(
          Array.isArray(data)
            ? data.map((z: Zone) => ({ ...z, zipRanges: z.zipRanges ?? [] }))
            : []
        )
      )
      .catch(() => setError("No se pudieron cargar las tarifas"))
      .finally(() => setLoading(false));
  }, []);

  const updateZone = (id: string, field: "flex" | "standard", value: number) => {
    setZones((prev) => prev.map((z) => (z.id === id ? { ...z, [field]: value } : z)));
    setSaved(false);
  };

  const addRange = (zoneId: string) => {
    setZones((prev) =>
      prev.map((z) =>
        z.id === zoneId
          ? { ...z, zipRanges: [...z.zipRanges, { min: 0, max: 0 }] }
          : z
      )
    );
    setSaved(false);
  };

  const updateRange = (zoneId: string, idx: number, field: "min" | "max", value: number) => {
    setZones((prev) =>
      prev.map((z) =>
        z.id === zoneId
          ? {
              ...z,
              zipRanges: z.zipRanges.map((r, i) =>
                i === idx ? { ...r, [field]: value } : r
              ),
            }
          : z
      )
    );
    setSaved(false);
  };

  const removeRange = (zoneId: string, idx: number) => {
    setZones((prev) =>
      prev.map((z) =>
        z.id === zoneId
          ? { ...z, zipRanges: z.zipRanges.filter((_, i) => i !== idx) }
          : z
      )
    );
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/shipping/zones", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zones }),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Error al guardar las tarifas");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-100 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Tarifas de envío</h1>
        <p className="text-sm text-gray-500 mt-1">
          Ajustá los precios y los rangos de código postal por zona del AMBA.
        </p>
      </div>

      {zones.map((zone) => (
        <div key={zone.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">

          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50">
            <div className="w-8 h-8 bg-[#1E3A8A] rounded-lg flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">{zone.name}</p>
              <p className="text-xs text-gray-500 line-clamp-1">{zone.localities.join(" · ")}</p>
            </div>
          </div>

          <div className="p-5 space-y-5">

            {/* Tarifas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-green-700 mb-2">
                  <Zap className="w-3.5 h-3.5" /> Envío flex
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">$</span>
                  <input
                    type="number"
                    value={zone.flex}
                    min={0}
                    onChange={(e) => updateZone(zone.id, "flex", Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl pl-7 pr-3 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400"
                  />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 mb-2">
                  <Truck className="w-3.5 h-3.5" /> Envío estándar
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">$</span>
                  <input
                    type="number"
                    value={zone.standard}
                    min={0}
                    onChange={(e) => updateZone(zone.id, "standard", Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl pl-7 pr-3 py-2.5 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                  />
                </div>
              </div>
            </div>

            {/* Rangos de CP */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-600">Rangos de código postal</p>
                <button
                  type="button"
                  onClick={() => addRange(zone.id)}
                  className="flex items-center gap-1 text-xs text-[#1E3A8A] font-semibold hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar rango
                </button>
              </div>

              {zone.zipRanges.length === 0 && (
                <p className="text-xs text-gray-400 italic">
                  Sin rangos configurados — se usará solo el nombre de ciudad.
                </p>
              )}

              <div className="space-y-2">
                {zone.zipRanges.map((range, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="flex items-center gap-2 flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                      <input
                        type="number"
                        value={range.min}
                        min={0}
                        onChange={(e) => updateRange(zone.id, idx, "min", Number(e.target.value))}
                        className="w-20 text-sm font-mono text-gray-800 bg-transparent focus:outline-none"
                        placeholder="desde"
                      />
                      <span className="text-gray-400 text-sm select-none">–</span>
                      <input
                        type="number"
                        value={range.max}
                        min={0}
                        onChange={(e) => updateRange(zone.id, idx, "max", Number(e.target.value))}
                        className="w-20 text-sm font-mono text-gray-800 bg-transparent focus:outline-none"
                        placeholder="hasta"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeRange(zone.id, idx)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      ))}

      {/* Interior */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
        <p className="text-sm font-semibold text-gray-700 mb-1">Interior del país</p>
        <p className="text-xs text-gray-500">
          Los envíos al interior se gestionan por Correo Argentino, Andreani u OCA.
          El precio se coordina directamente con el cliente vía WhatsApp.
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#1E3A8A] hover:bg-blue-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-60"
        >
          {saving ? (
            <RotateCcw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? "Guardando..." : "Guardar tarifas"}
        </button>
        {saved && (
          <span className="text-sm text-green-600 font-semibold">
            ✓ Tarifas guardadas
          </span>
        )}
      </div>
    </div>
  );
}
