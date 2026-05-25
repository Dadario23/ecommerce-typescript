"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, RefreshCw, Search } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────
interface Msg {
  id: string;
  role: "bot" | "user";
  html: string;
  isCard?: boolean;
  card?: { brand: string; model: string; repair: string; price: string };
}
type Step =
  | "init" | "wet" | "loading" | "brand" | "model"
  | "repair" | "name" | "done" | "error";

interface ModelRow { Marca: string; Modelo: string; Activo: string }
interface PriceRow { Marca: string; Modelo: string; TipoReparacion: string; PrecioFinal: string }

// ── Constants ─────────────────────────────────────────────────────────
const SHEET_ID =
  process.env.NEXT_PUBLIC_GOOGLE_SHEETS_ID ??
  "1JC3oSS3CRqMuqzkjtVpIHuqG_mlUW7YALPnp55Y5Ark";
const WA = "5491150610043";

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const uid   = () => Math.random().toString(36).slice(2);

function iconFor(label: string) {
  const l = label.toLowerCase();
  if (/pantalla|modulo|módulo/.test(l)) return "📱";
  if (/carga|pin/.test(l))              return "🔌";
  if (/bater/.test(l))                  return "🔋";
  if (/altavoz|principal/.test(l))      return "🔊";
  if (/camara|cámara|trasera/.test(l))  return "📷";
  if (/selfie|frontal|auricular/.test(l)) return "🤳";
  if (/contraseña|patron|patrón/.test(l)) return "🔓";
  return "🔧";
}

function fmtPrice(p: string | number) {
  const n = parseFloat(String(p).replace(/[^0-9.]/g, ""));
  return isNaN(n) ? String(p) : n.toLocaleString("es-AR");
}

function norm(s = "") {
  return s.toLowerCase().normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]/g, "").trim();
}

async function fetchSheet<T>(name: string): Promise<T[]> {
  const url = `https://opensheet.elk.sh/${SHEET_ID}/${encodeURIComponent(name)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error("Non-array");
  return data as T[];
}

// ── Main component ────────────────────────────────────────────────────
export default function ChatBot() {
  const [msgs,    setMsgs]    = useState<Msg[]>([]);
  const [typing,  setTyping]  = useState(false);
  const [step,    setStep]    = useState<Step>("init");
  const [models,  setModels]  = useState<ModelRow[]>([]);
  const [prices,  setPrices]  = useState<PriceRow[]>([]);
  const [brands,  setBrands]  = useState<string[]>([]);
  const [sel,     setSel]     = useState({ brand: "", model: "", repair: "", price: "" });
  const [modelQ,  setModelQ]  = useState("");
  const [nameVal, setNameVal] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);
  const mounted = useRef(true);
  const started = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [msgs, typing]);

  // ── Helpers ────────────────────────────────────────────────────────
  function addMsg(msg: Omit<Msg, "id">) {
    if (!mounted.current) return;
    setMsgs((p) => [...p, { ...msg, id: uid() }]);
  }

  async function botSay(html: string, delay = 900) {
    if (!mounted.current) return;
    setTyping(true);
    await sleep(delay);
    if (!mounted.current) return;
    setTyping(false);
    addMsg({ role: "bot", html });
  }

  function userSay(text: string) {
    addMsg({ role: "user", html: text });
  }

  // ── Flow ───────────────────────────────────────────────────────────
  async function doInit() {
    await botSay(
      "¡Hola! 👋 Soy el asistente de <strong>CompuMobile</strong>.<br>Te ayudo a obtener un presupuesto para la reparación de tu celular en segundos.",
      1000
    );
    await sleep(200);
    await botSay("Antes de empezar… ¿el equipo estuvo en contacto con agua o humedad?", 800);
    if (mounted.current) setStep("init");
  }

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    doInit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleWet() {
    userSay("💧 Se mojó");
    setStep("wet");
    await botSay(
      "⚠️ <strong>No realizamos reparaciones en equipos mojados</strong> ya que no podemos ofrecer garantía sobre el resultado.<br><br>" +
      "Si el equipo se secó completamente y llevás al menos 48 h sin usarlo, podés intentarlo de nuevo.",
      800
    );
  }

  async function loadAndShowBrands() {
    userSay("✅ Está seco");
    setStep("loading");
    const loadId = uid();
    setMsgs((p) => [...p, { id: loadId, role: "bot", html: "Cargando catálogo…" }]);

    try {
      const [mRows, pRows] = await Promise.all([
        fetchSheet<ModelRow>("Modelos"),
        fetchSheet<PriceRow>("Precios"),
      ]);
      if (!mounted.current) return;

      // All brands in the sheet, regardless of Activo (same as original chatbot)
      const b = [...new Set(mRows.map(r => r.Marca).filter(Boolean))].sort();

      setModels(mRows);
      setPrices(pRows);
      setBrands(b);
      setMsgs((p) => p.filter(m => m.id !== loadId));
      await botSay("¡Perfecto! ¿Cuál es la <strong>marca</strong> de tu celular?", 600);
      setStep("brand");
    } catch {
      setMsgs((p) => p.filter(m => m.id !== loadId));
      await botSay("No pude cargar el catálogo en este momento. Podés consultarnos directamente por WhatsApp.", 500);
      setStep("error");
    }
  }

  async function selectBrand(brand: string) {
    userSay(`📱 ${brand}`);
    setSel({ brand, model: "", repair: "", price: "" });
    setModelQ("");
    setStep("model");
    await botSay(`¿Cuál es el <strong>modelo</strong> de tu ${brand}?`, 700);
  }

  async function selectModel(model: string) {
    userSay(`📲 ${model}`);
    setSel((p) => ({ ...p, model, repair: "", price: "" }));
    setStep("repair");
    await botSay("¿Cuál es la <strong>falla o reparación</strong> que necesitás?", 700);
  }

  async function selectRepair(repair: string, brand: string, model: string) {
    userSay(`🔧 ${repair}`);
    setSel((p) => ({ ...p, repair, price: "" }));
    setTyping(true);
    await sleep(1400);
    if (!mounted.current) return;
    setTyping(false);

    const row = prices.find(r =>
      norm(r.Marca) === norm(brand) &&
      norm(r.Modelo) === norm(model) &&
      norm(r.TipoReparacion) === norm(repair)
    );

    if (row?.PrecioFinal) {
      setSel((p) => ({ ...p, price: row.PrecioFinal }));
      addMsg({ role: "bot", html: "", isCard: true, card: { brand, model, repair, price: row.PrecioFinal } });
      await sleep(400);
      await botSay("¿Querés coordinar la reparación? Primero decime tu nombre 👇", 500);
    } else {
      await botSay("No tenemos precio cargado para ese modelo, pero podés consultarnos y te respondemos enseguida.", 500);
      setSel((p) => ({ ...p, price: "a consultar" }));
      await botSay("Para avisarte por WhatsApp, ¿cuál es tu nombre?", 500);
    }
    setStep("name");
  }

  async function submitName() {
    const name = nameVal.trim();
    if (!name) return;
    userSay(`👤 ${name}`);
    setNameVal("");
    await botSay(
      `¡Listo, <strong>${name}</strong>! Cuando quieras, envianos el resumen por WhatsApp y coordinamos. 🚀`,
      800
    );
    setStep("done");
  }

  function restart() {
    setMsgs([]);
    setSel({ brand: "", model: "", repair: "", price: "" });
    setModelQ("");
    setNameVal("");
    setTyping(false);
    setStep("init");
    started.current = false;
    doInit();
  }

  // ── Derived ────────────────────────────────────────────────────────
  const availableModels = [...new Set(
    models
      .filter(r => {
        if (r.Marca?.toLowerCase() !== sel.brand.toLowerCase()) return false;
        const a = r.Activo?.trim();
        if (!a) return true; // blank Activo → include (same as original)
        return a.toLowerCase() === "sí" || a.toLowerCase() === "si";
      })
      .map(r => r.Modelo).filter(Boolean)
  )].sort();

  const filteredModels = modelQ
    ? availableModels.filter(m => m.toLowerCase().includes(modelQ.toLowerCase()))
    : availableModels;

  const availableRepairs = [...new Set(
    prices
      .filter(r => norm(r.Marca) === norm(sel.brand) && norm(r.Modelo) === norm(sel.model) && r.TipoReparacion)
      .map(r => r.TipoReparacion.trim()).filter(Boolean)
  )];

  const waMsg = `Hola! Tengo un ${sel.brand} ${sel.model}${sel.repair ? ` con falla: ${sel.repair}` : ""}${sel.price && sel.price !== "a consultar" ? `. Presupuesto estimado: $${fmtPrice(sel.price)}` : ""}. Quisiera coordinar la reparación.`;
  const waUrl = `https://wa.me/${WA}?text=${encodeURIComponent(waMsg)}`;

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes cmBounce {
          0%,60%,100% { transform: translateY(0); }
          30%          { transform: translateY(-6px); }
        }
        @keyframes cmSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cm-msg { animation: cmSlideIn .25s ease forwards; }
        .cm-opt:hover { background: #eff6ff !important; border-color: #1E3A8A !important; color: #1E3A8A !important; }
      `}</style>

      <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white flex flex-col" style={{ height: 560 }}>

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 shrink-0" style={{ background: "#1E3A8A" }}>
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-lg shrink-0">
            📱
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-tight">Asistente CompuMobile</p>
            <p className="text-blue-200 text-xs">Presupuestos al instante</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-xs text-blue-200">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
            En línea
          </div>
        </div>

        {/* Chat area */}
        <div ref={chatRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-gray-50">
          {msgs.map((m) => (
            <div key={m.id} className={`cm-msg flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "bot" && (
                <div className="w-7 h-7 rounded-full bg-[#1E3A8A] flex items-center justify-center text-white text-xs font-bold shrink-0 self-end mr-2">
                  CM
                </div>
              )}
              {m.isCard && m.card ? (
                <div className="max-w-xs rounded-2xl border border-[#1E3A8A] bg-blue-50 overflow-hidden shadow-sm">
                  <div className="bg-[#1E3A8A] px-4 py-2.5">
                    <p className="text-xs font-bold text-white uppercase tracking-wider">✅ Presupuesto estimado</p>
                  </div>
                  <div className="px-4 py-3 space-y-2">
                    {([["Equipo", `${m.card.brand} ${m.card.model}`], ["Reparación", m.card.repair]] as [string, string][]).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-sm border-b border-blue-100 pb-2">
                        <span className="text-gray-500">{k}</span>
                        <span className="font-semibold text-gray-800 text-right max-w-36 truncate">{v}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-sm text-gray-500">Precio</span>
                      <span className="text-2xl font-bold text-[#1E3A8A]">${fmtPrice(m.card.price)}</span>
                    </div>
                  </div>
                  <p className="px-4 pb-3 text-[11px] text-gray-400">⚡ Precio estimado. Puede variar según diagnóstico en taller.</p>
                </div>
              ) : (
                <div
                  className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-[#1E3A8A] text-white rounded-br-sm"
                      : "bg-white border border-gray-200 text-gray-700 rounded-bl-sm shadow-sm"
                  }`}
                  dangerouslySetInnerHTML={{ __html: m.html }}
                />
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {typing && (
            <div className="flex justify-start">
              <div className="w-7 h-7 rounded-full bg-[#1E3A8A] flex items-center justify-center text-white text-xs font-bold shrink-0 self-end mr-2">CM</div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  {[0, 200, 400].map((d, i) => (
                    <span key={i} className="w-2 h-2 rounded-full bg-gray-300 inline-block" style={{ animation: `cmBounce 1.2s ${d}ms infinite` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action zone */}
        <div className="shrink-0 border-t border-gray-100 bg-white px-4 pt-3 pb-4 flex flex-col gap-2.5 overflow-y-auto" style={{ maxHeight: "42%" }}>

          {step === "init" && (
            <>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">¿Contacto con agua?</p>
              <div className="flex flex-wrap gap-2">
                <ActionBtn onClick={loadAndShowBrands} primary>✅ No, está seco</ActionBtn>
                <ActionBtn onClick={handleWet} danger>💧 Sí, se mojó</ActionBtn>
              </div>
            </>
          )}

          {(step === "wet" || step === "error") && (
            <ActionBtn onClick={restart} full icon={<RefreshCw className="w-4 h-4" />}>
              Nuevo presupuesto
            </ActionBtn>
          )}

          {step === "loading" && (
            <p className="text-sm text-gray-400 py-1">Cargando catálogo…</p>
          )}

          {step === "brand" && (
            <>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Elegí la marca</p>
              <div className="flex flex-wrap gap-2">
                {brands.map(b => (
                  <ActionBtn key={b} onClick={() => selectBrand(b)}>📱 {b}</ActionBtn>
                ))}
              </div>
            </>
          )}

          {step === "model" && (
            <>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Buscá tu modelo · {availableModels.length} disponibles
              </p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  autoFocus
                  value={modelQ}
                  onChange={e => setModelQ(e.target.value)}
                  placeholder="Ej: Galaxy A52, Moto G84, iPhone 14…"
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-[#1E3A8A] placeholder:text-gray-400"
                />
              </div>
              {filteredModels.length === 0 ? (
                <p className="text-sm text-gray-400">
                  Sin coincidencias.{" "}
                  <a href={`https://wa.me/${WA}?text=${encodeURIComponent(`Hola! Quisiera un presupuesto para reparar mi ${sel.brand}.`)}`} target="_blank" rel="noopener noreferrer" className="text-[#1E3A8A] font-medium hover:underline">
                    Consultanos por WhatsApp
                  </a>
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {filteredModels.map(m => {
                    const q = modelQ.toLowerCase();
                    const idx = m.toLowerCase().indexOf(q);
                    const hl = q && idx >= 0
                      ? m.slice(0, idx) + `<mark class="bg-blue-100 text-[#1E3A8A] rounded px-0.5">${m.slice(idx, idx + q.length)}</mark>` + m.slice(idx + q.length)
                      : m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => selectModel(m)}
                        className="cm-opt flex-1 basis-[calc(50%-4px)] min-w-28 flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl bg-white transition-colors text-left"
                        dangerouslySetInnerHTML={{ __html: `<span>📲</span><span>${hl}</span>` }}
                      />
                    );
                  })}
                </div>
              )}
              <ActionBtn full onClick={() => { setSel(p => ({ ...p, brand: "", model: "" })); setStep("brand"); }}>
                ← Cambiar marca
              </ActionBtn>
            </>
          )}

          {step === "repair" && (
            <>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Tipo de reparación</p>
              {availableRepairs.length === 0 ? (
                <ActionBtn full whatsapp href={`https://wa.me/${WA}?text=${encodeURIComponent(`Hola! Quisiera un presupuesto para ${sel.brand} ${sel.model}.`)}`} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-4 h-4" /> Consultar por WhatsApp
                </ActionBtn>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {availableRepairs.map(r => (
                    <ActionBtn key={r} onClick={() => selectRepair(r, sel.brand, sel.model)}>
                      {iconFor(r)} {r}
                    </ActionBtn>
                  ))}
                </div>
              )}
              <ActionBtn full onClick={() => { setSel(p => ({ ...p, model: "", repair: "" })); setModelQ(""); setStep("model"); }}>
                ← Cambiar modelo
              </ActionBtn>
            </>
          )}

          {step === "name" && (
            <form onSubmit={e => { e.preventDefault(); submitName(); }} className="flex gap-2">
              <input
                autoFocus
                value={nameVal}
                onChange={e => setNameVal(e.target.value)}
                placeholder="Tu nombre…"
                maxLength={40}
                className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-[#1E3A8A] placeholder:text-gray-400"
              />
              <button type="submit" className="px-5 py-2.5 bg-[#1E3A8A] text-white text-sm font-bold rounded-xl hover:bg-blue-800 transition-colors">
                Listo →
              </button>
            </form>
          )}

          {step === "done" && (
            <div className="flex flex-col gap-2">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm px-5 py-3 rounded-xl transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Enviar por WhatsApp
              </a>
              <button
                type="button"
                onClick={restart}
                className="flex items-center justify-center gap-2 text-sm text-gray-500 border border-gray-200 rounded-xl px-4 py-2.5 hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Nuevo presupuesto
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── ActionBtn helper ──────────────────────────────────────────────────
interface ABProps {
  children: React.ReactNode;
  onClick?: () => void;
  primary?: boolean;
  danger?: boolean;
  full?: boolean;
  whatsapp?: boolean;
  href?: string;
  target?: string;
  rel?: string;
  icon?: React.ReactNode;
}
function ActionBtn({ children, onClick, primary, danger, full, whatsapp, href, target, rel }: ABProps) {
  const base = [
    "cm-opt flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-xl border transition-colors",
    full ? "w-full justify-center" : "flex-1 basis-[calc(50%-4px)] min-w-28",
    primary  ? "bg-[#1E3A8A] text-white border-[#1E3A8A] hover:bg-blue-800"
    : danger   ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
    : whatsapp ? "bg-[#25D366] text-white border-transparent hover:bg-[#20bd5a]"
    : "bg-white text-gray-700 border-gray-200",
  ].join(" ");

  if (href) {
    return <a href={href} target={target} rel={rel} className={base}>{children}</a>;
  }
  return <button type="button" onClick={onClick} className={base}>{children}</button>;
}
