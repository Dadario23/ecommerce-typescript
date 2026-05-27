import { Truck, Store, CreditCard, Shield } from "lucide-react";

const benefits = [
  {
    icon: Truck,
    title: "Envío gratis a todo el país",
    sub: "Despacho en 24–48 hs hábiles",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: Store,
    title: "Retiro gratis en sucursal",
    sub: "Disponible en 3 horas",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    icon: CreditCard,
    title: "Hasta 12 cuotas sin interés",
    sub: "Todas las tarjetas de crédito",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Shield,
    title: "Garantía oficial 12 meses",
    sub: "Compra 100% protegida",
    color: "text-emerald-800",
    bg: "bg-emerald-100",
  },
];

export default function ProductShipping() {
  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden">
      {benefits.map(({ icon: Icon, title, sub, color, bg }, i) => (
        <div
          key={i}
          className={`flex items-center gap-3 px-4 py-3 ${
            i !== benefits.length - 1 ? "border-b border-gray-100" : ""
          }`}
        >
          <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">{title}</p>
            <p className="text-xs text-gray-500">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
