"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, X, Loader2, CheckCircle2 } from "lucide-react";

type DeviceType = "celular" | "laptop" | "pc";

const inputCls =
  "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-[#1E3A8A] placeholder:text-gray-400";

export default function NuevaReparacionForm({ presupuestoId }: { presupuestoId?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [prefilled, setPrefilled] = useState(false);

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [tipo, setTipo] = useState<DeviceType>("celular");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [fallas, setFallas] = useState<string[]>([""]);
  const [presupuesto, setPresupuesto] = useState("");
  const [notaCliente, setNotaCliente] = useState("");
  const [notaInterna, setNotaInterna] = useState("");

  useEffect(() => {
    if (!presupuestoId) return;
    fetch(`/api/presupuestos/${presupuestoId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) return;
        setNombre(data.cliente?.nombre ?? "");
        setEmail(data.cliente?.email ?? "");
        setTipo(data.equipo?.tipo ?? "celular");
        setMarca(data.equipo?.marca ?? "");
        setModelo(data.equipo?.modelo ?? "");
        const fallasList: string[] = (data.items ?? []).map((i: { repair: string }) => i.repair);
        setFallas(fallasList.length > 0 ? fallasList : [""]);
        if (data.totalEstimado) setPresupuesto(String(data.totalEstimado));
        setPrefilled(true);
      })
      .catch(() => {});
  }, [presupuestoId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const fallasFilled = fallas.filter((f) => f.trim());
    if (!nombre.trim() || !telefono.trim() || !marca.trim() || !modelo.trim()) {
      setError("Completá los campos obligatorios.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/reparaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente: { nombre: nombre.trim(), telefono: telefono.trim(), email: email.trim() || undefined },
          equipo: { tipo, marca: marca.trim(), modelo: modelo.trim() },
          fallas: fallasFilled,
          presupuesto: presupuesto ? Number(presupuesto) : undefined,
          notaCliente: notaCliente.trim() || undefined,
          notaInterna: notaInterna.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Error al crear la reparación");
      }
      const data = await res.json();

      if (presupuestoId) {
        await fetch(`/api/presupuestos/${presupuestoId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estado: "convertido", reparacionId: data._id }),
        }).catch(() => {});
      }

      router.push(`/soporte-tecnico/admin/reparaciones/${data._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setLoading(false);
    }
  }

  const backHref = presupuestoId
    ? "/soporte-tecnico/admin/presupuestos"
    : "/soporte-tecnico/admin/reparaciones";

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href={backHref} className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Nueva reparación</h1>
          <p className="text-sm text-gray-500">Registrá el equipo del cliente</p>
        </div>
      </div>

      {prefilled && (
        <div className="flex items-center gap-2.5 bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          <p className="text-sm text-green-700">
            Datos pre-llenados desde el autopresupuesto del cliente. Revisá y completá el teléfono.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Section title="Datos del cliente">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Nombre *">
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre completo" required className={inputCls} />
            </Field>
            <Field label="Teléfono *">
              <input value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="+54 11 1234-5678" required className={inputCls} />
            </Field>
          </div>
          <Field label="Email (vincula al cliente con su cuenta)">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="cliente@email.com" className={inputCls} />
          </Field>
        </Section>

        <Section title="Equipo">
          <Field label="Tipo *">
            <div className="flex gap-2">
              {(["celular", "laptop", "pc"] as DeviceType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTipo(t)}
                  className={`flex-1 py-2 px-3 rounded-xl border text-sm font-medium transition-colors ${
                    tipo === t
                      ? "bg-[#1E3A8A] text-white border-[#1E3A8A]"
                      : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                  }`}
                >
                  {t === "pc" ? "PC" : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Marca *">
              <input value={marca} onChange={(e) => setMarca(e.target.value)} placeholder="Samsung, HP, Apple…" required className={inputCls} />
            </Field>
            <Field label="Modelo *">
              <input value={modelo} onChange={(e) => setModelo(e.target.value)} placeholder="Galaxy A52, Pavilion 15…" required className={inputCls} />
            </Field>
          </div>
        </Section>

        <Section title="Fallas o servicios">
          <div className="space-y-2">
            {fallas.map((f, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={f}
                  onChange={(e) => setFallas((prev) => prev.map((v, idx) => (idx === i ? e.target.value : v)))}
                  placeholder={`Falla ${i + 1}…`}
                  className={`${inputCls} flex-1`}
                />
                {fallas.length > 1 && (
                  <button type="button" onClick={() => setFallas((prev) => prev.filter((_, idx) => idx !== i))} className="text-gray-400 hover:text-red-500 transition-colors p-2">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setFallas((f) => [...f, ""])} className="flex items-center gap-1.5 text-sm text-[#1E3A8A] font-medium hover:underline mt-1">
            <Plus className="w-3.5 h-3.5" />
            Agregar falla
          </button>
        </Section>

        <Section title="Presupuesto y notas">
          <Field label="Presupuesto estimado (opcional)">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
              <input type="number" value={presupuesto} onChange={(e) => setPresupuesto(e.target.value)} placeholder="0" min={0} className={`${inputCls} pl-7`} />
            </div>
          </Field>
          <Field label="Nota para el cliente (visible en el seguimiento)">
            <textarea value={notaCliente} onChange={(e) => setNotaCliente(e.target.value)} rows={2} placeholder="Ej: El equipo ya fue revisado, esperamos la pieza." className={`${inputCls} resize-none`} />
          </Field>
          <Field label="Nota interna (solo admin)">
            <textarea value={notaInterna} onChange={(e) => setNotaInterna(e.target.value)} rows={2} placeholder="Notas técnicas internas…" className={`${inputCls} resize-none`} />
          </Field>
        </Section>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
        )}

        <div className="flex gap-3">
          <Link href={backHref} className="flex-1 text-center py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            Cancelar
          </Link>
          <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-white bg-[#1E3A8A] hover:bg-blue-800 rounded-xl transition-colors disabled:opacity-60">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Registrar reparación
          </button>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}
