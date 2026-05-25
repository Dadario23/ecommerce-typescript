"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Home,
  CreditCard,
  MapPin,
} from "lucide-react";

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface ShippingAddress {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  createdAt: string;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  shippingAddress: ShippingAddress;
  payment: {
    method: string;
    status: string;
    transactionId?: string;
  };
  trackingNumber?: string;
  notes?: string;
}

const STATUS_CONFIG = {
  pending:    { label: "Pendiente",   icon: Clock,        pill: "bg-yellow-100 text-yellow-700", step: 0 },
  confirmed:  { label: "Confirmado",  icon: CheckCircle,  pill: "bg-blue-100 text-blue-700",    step: 1 },
  processing: { label: "Procesando",  icon: Package,      pill: "bg-blue-100 text-blue-700",    step: 1 },
  shipped:    { label: "En camino",   icon: Truck,        pill: "bg-purple-100 text-purple-700", step: 2 },
  delivered:  { label: "Entregado",   icon: CheckCircle,  pill: "bg-green-100 text-green-700",  step: 3 },
  cancelled:  { label: "Cancelado",   icon: XCircle,      pill: "bg-red-100 text-red-700",      step: -1 },
};

const TIMELINE_STEPS = [
  { icon: CheckCircle, label: "Confirmado" },
  { icon: Package,     label: "Preparando" },
  { icon: Truck,       label: "En camino"  },
  { icon: Home,        label: "Entregado"  },
];

const PAYMENT_LABELS: Record<string, string> = {
  mercadopago: "Mercado Pago",
  cash: "Contra entrega",
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/orders/${id}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(r.status === 404 ? "not_found" : "error");
        return r.json();
      })
      .then(setOrder)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-5 bg-gray-100 rounded w-32" />
        <div className="h-7 bg-gray-100 rounded w-56 mt-4" />
        <div className="h-32 bg-gray-100 rounded-xl mt-4" />
        <div className="h-48 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Package className="w-6 h-6 text-gray-300" />
        </div>
        <p className="font-semibold text-gray-700 mb-1">
          {error === "not_found" ? "Pedido no encontrado" : "No se pudo cargar el pedido"}
        </p>
        <p className="text-sm text-gray-400 mb-5">
          {error === "not_found"
            ? "El pedido no existe o no tenés acceso"
            : "Intentá de nuevo en unos instantes"}
        </p>
        <Link
          href="/account/orders"
          className="text-sm text-[#1E3A8A] font-semibold hover:underline flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver a mis pedidos
        </Link>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
  const StatusIcon = cfg.icon;
  const isCancelled = order.status === "cancelled";
  const currentStep = cfg.step;

  const addr = order.shippingAddress;

  return (
    <div className="space-y-5">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1E3A8A] font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Mis pedidos
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-gray-900 font-mono">
            #{order.orderNumber}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date(order.createdAt).toLocaleDateString("es-AR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${cfg.pill}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {cfg.label}
        </span>
      </div>

      {/* Timeline */}
      {!isCancelled && (
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between relative">
            {/* Connecting line */}
            <div className="absolute left-4 right-4 top-4 h-px bg-gray-200 z-0" />

            {TIMELINE_STEPS.map((step, i) => {
              const done = i <= currentStep;
              const active = i === currentStep;
              const Icon = step.icon;
              return (
                <div key={i} className="flex flex-col items-center gap-2 z-10">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      done
                        ? "bg-[#1E3A8A] border-[#1E3A8A]"
                        : "bg-white border-gray-200"
                    } ${active ? "ring-4 ring-blue-100" : ""}`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${done ? "text-white" : "text-gray-300"}`} />
                  </div>
                  <span className={`text-[10px] font-medium text-center ${done ? "text-[#1E3A8A]" : "text-gray-400"}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {order.trackingNumber && (
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm">
          <Truck className="w-4 h-4 text-blue-500 shrink-0" />
          <span className="text-blue-700">
            N° de seguimiento:{" "}
            <span className="font-mono font-semibold">{order.trackingNumber}</span>
          </span>
        </div>
      )}

      {/* Items */}
      <div className="border border-gray-100 rounded-xl overflow-hidden">
        <p className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-50">
          Productos ({order.items.length})
        </p>
        <ul className="divide-y divide-gray-50">
          {order.items.map((item, i) => (
            <li key={i} className="flex items-center gap-4 px-4 py-3">
              <div className="relative w-14 h-14 shrink-0 rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                <Image
                  src={item.image || "/placeholder.png"}
                  alt={item.name}
                  fill
                  sizes="56px"
                  className="object-contain p-1"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug">
                  {item.name}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {item.quantity} × ${item.price.toLocaleString("es-AR")}
                </p>
              </div>
              <span className="text-sm font-bold text-gray-900 shrink-0">
                ${(item.price * item.quantity).toLocaleString("es-AR")}
              </span>
            </li>
          ))}
        </ul>

        {/* Totals */}
        <div className="border-t border-gray-100 px-4 py-3 space-y-1.5 bg-gray-50">
          {order.discount > 0 && (
            <>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>${order.subtotal.toLocaleString("es-AR")}</span>
              </div>
              <div className="flex justify-between text-sm text-green-600 font-medium">
                <span>Descuento</span>
                <span>−${order.discount.toLocaleString("es-AR")}</span>
              </div>
            </>
          )}
          {order.shipping > 0 && (
            <div className="flex justify-between text-sm text-gray-500">
              <span>Envío</span>
              <span>${order.shipping.toLocaleString("es-AR")}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-200">
            <span>Total</span>
            <span className="text-base">${order.total.toLocaleString("es-AR")}</span>
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Shipping address */}
        <div className="border border-gray-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-gray-400" />
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Dirección de envío
            </p>
          </div>
          <div className="text-sm text-gray-700 space-y-0.5">
            <p className="font-medium">{addr.firstName} {addr.lastName}</p>
            <p>{addr.street}</p>
            <p>{addr.city}, {addr.state} {addr.zipCode}</p>
            <p>{addr.country}</p>
            {addr.phone && <p className="text-gray-500">{addr.phone}</p>}
          </div>
        </div>

        {/* Payment */}
        <div className="border border-gray-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-4 h-4 text-gray-400" />
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Pago
            </p>
          </div>
          <div className="text-sm text-gray-700 space-y-1">
            <p className="font-medium">
              {PAYMENT_LABELS[order.payment.method] ?? order.payment.method}
            </p>
            <p className={`text-xs font-semibold ${
              order.payment.status === "completed"
                ? "text-green-600"
                : order.payment.status === "pending"
                ? "text-yellow-600"
                : "text-gray-500"
            }`}>
              {order.payment.status === "completed" ? "Pago recibido"
                : order.payment.status === "pending" ? "Pendiente de pago"
                : order.payment.status}
            </p>
            {order.payment.transactionId && (
              <p className="text-xs text-gray-400 font-mono break-all">
                {order.payment.transactionId}
              </p>
            )}
          </div>
        </div>
      </div>

      {order.notes && (
        <div className="bg-yellow-50 border border-yellow-100 rounded-xl px-4 py-3 text-sm text-yellow-800">
          <span className="font-medium">Nota: </span>{order.notes}
        </div>
      )}
    </div>
  );
}
