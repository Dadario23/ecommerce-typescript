import ChatBot from "./ChatBot";
import {
  Smartphone,
  Building2,
  Wrench,
  Shield,
  Clock,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";

export const revalidate = 300;

const WA_NUMBER = "5491150610043";
const WA_EMPRESA = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
  "Hola! Soy de una empresa y quiero consultar sobre soporte técnico para nuestros equipos."
)}`;

const PERSONAL_SERVICES = [
  "Cambio de módulo / pantalla",
  "Cambio de batería",
  "Reparación de pin de carga",
  "Reparación de computadoras",
  "Formateo y optimización",
  "Limpieza y mantenimiento",
];

const ENTERPRISE_SERVICES = [
  "Mantenimiento preventivo de equipos",
  "Soporte técnico en sitio",
  "Formateo y configuración en escala",
  "Instalación de redes y cableado",
  "Asesoría en compra de hardware",
  "Contratos de soporte mensual",
];

export default function SoporteTecnicoPage() {
  return (
    <main className="pt-24 md:pt-36 pb-20 bg-gray-50 min-h-screen">

      {/* ── HERO ── */}
      <section className="bg-[#1E3A8A] text-white py-12 md:py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-blue-300 text-xs font-semibold uppercase tracking-widest mb-3">
            Compumobile · Soporte Técnico
          </p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3">
            Tu equipo en buenas manos
          </h1>
          <p className="text-blue-200 text-sm md:text-base max-w-lg mx-auto">
            Reparamos celulares y computadoras con repuestos de calidad.
            También brindamos soporte técnico a empresas y pymes.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4">

        {/* ── SERVICE CARDS ── */}
        <div className="grid md:grid-cols-2 gap-4 -mt-6">
          {/* Particulares */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <Smartphone className="w-4.5 h-4.5 text-[#1E3A8A]" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">Clientes Particulares</p>
                <p className="text-xs text-gray-400">Celulares y computadoras</p>
              </div>
            </div>
            <ul className="space-y-1.5">
              {PERSONAL_SERVICES.map((s) => (
                <li key={s} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1E3A8A] shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Empresas */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <Building2 className="w-4.5 h-4.5 text-[#1E3A8A]" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">Empresas y Pymes</p>
                <p className="text-xs text-gray-400">Soporte empresarial</p>
              </div>
            </div>
            <ul className="space-y-1.5 mb-4">
              {ENTERPRISE_SERVICES.map((s) => (
                <li key={s} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1E3A8A] shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
            <a
              href={WA_EMPRESA}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#1E3A8A] hover:bg-blue-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Consultar para mi empresa
            </a>
          </div>
        </div>

        {/* ── CHATBOT SECTION ── */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Wrench className="w-4.5 h-4.5 text-[#1E3A8A]" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Autopresupuesto instantáneo</h2>
              <p className="text-xs text-gray-400">Obtené el precio de tu reparación en segundos</p>
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-2 mb-5 mt-3">
            {[
              { icon: Clock,        text: "Respuesta en el día" },
              { icon: Shield,       text: "Repuestos de calidad" },
              { icon: CheckCircle2, text: "Garantía incluida" },
            ].map(({ icon: Icon, text }) => (
              <span
                key={text}
                className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100"
              >
                <Icon className="w-3.5 h-3.5 text-[#1E3A8A]" />
                {text}
              </span>
            ))}
          </div>

          <ChatBot />
        </div>

        {/* ── ENTERPRISE CTA ── */}
        <div className="mt-5 bg-gray-900 text-white rounded-2xl p-5 md:p-7 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Para empresas</p>
            <h3 className="text-lg font-bold mb-1">¿Necesitás soporte técnico continuo?</h3>
            <p className="text-sm text-gray-400 max-w-sm">
              Contratos de mantenimiento mensual para mantener tus equipos funcionando sin interrupciones.
            </p>
          </div>
          <a
            href={WA_EMPRESA}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm px-5 py-3 rounded-xl transition-colors whitespace-nowrap shrink-0"
          >
            <MessageCircle className="w-4 h-4" />
            Hablar con un asesor
          </a>
        </div>

      </div>
    </main>
  );
}
