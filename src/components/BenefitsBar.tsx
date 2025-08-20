import { Truck, CreditCard, HelpCircle } from "lucide-react";

export default function BenefitsBar() {
  const benefits = [
    {
      icon: <CreditCard className="w-6 h-6 text-blue-600" />,
      title: "Medios de pago",
      subtitle: "Paga hasta en 24 cuotas",
    },
    {
      icon: <Truck className="w-6 h-6 text-blue-600" />,
      title: "Envíos gratis",
      subtitle: "Ver localidades",
    },
    {
      icon: <Truck className="w-6 h-6 text-blue-600" />,
      title: "Envío express",
      subtitle: "Ver localidades",
    },
    {
      icon: <HelpCircle className="w-6 h-6 text-blue-600" />,
      title: "Centro de ayuda",
      subtitle: "Encontrá toda la ayuda",
    },
  ];

  return (
    <div className="bg-white shadow-sm border-t border-b border-gray-200 py-3">
      <div className="max-w-7xl mx-auto flex flex-wrap justify-around items-center gap-6 px-4 text-sm">
        {benefits.map((b, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors"
          >
            {b.icon}
            <div>
              <p className="font-medium">{b.title}</p>
              <p className="text-gray-500 text-xs">{b.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
