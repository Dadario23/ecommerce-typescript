"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Clock, Truck, CheckCircle, XCircle, Package, Eye, ArrowRight } from "lucide-react";

interface Order {
  _id: string;
  orderNumber: string;
  createdAt: string;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  items: Array<{ name: string; quantity: number; price: number }>;
}

const STATUS_CONFIG: Record<
  Order["status"],
  { label: string; icon: React.ElementType; pill: string }
> = {
  pending:    { label: "Pendiente",   icon: Clock,        pill: "bg-yellow-100 text-yellow-700" },
  confirmed:  { label: "Confirmado",  icon: CheckCircle,  pill: "bg-blue-100 text-blue-700" },
  processing: { label: "Procesando",  icon: Package,      pill: "bg-blue-100 text-blue-700" },
  shipped:    { label: "En camino",   icon: Truck,        pill: "bg-purple-100 text-purple-700" },
  delivered:  { label: "Entregado",   icon: CheckCircle,  pill: "bg-green-100 text-green-700" },
  cancelled:  { label: "Cancelado",   icon: XCircle,      pill: "bg-red-100 text-red-700" },
};

function OrderSkeleton() {
  return (
    <div className="animate-pulse space-y-3 p-4 border border-gray-100 rounded-xl">
      <div className="flex justify-between">
        <div className="h-4 bg-gray-100 rounded w-32" />
        <div className="h-5 bg-gray-100 rounded-full w-24" />
      </div>
      <div className="h-3 bg-gray-100 rounded w-48" />
      <div className="h-3 bg-gray-100 rounded w-64" />
      <div className="flex justify-between pt-1">
        <div className="h-4 bg-gray-100 rounded w-20" />
        <div className="h-4 bg-gray-100 rounded w-16" />
      </div>
    </div>
  );
}

export default function OrdersClient() {
  const { status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/orders/user")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setIsLoading(false));
  }, [status]);

  if (isLoading || status === "loading") {
    return (
      <div className="space-y-4">
        <div className="h-7 bg-gray-100 rounded w-48 animate-pulse mb-6" />
        {[1, 2, 3].map((i) => <OrderSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Mis pedidos</h2>
        <Link
          href="/"
          className="flex items-center gap-1 text-sm text-[#1E3A8A] font-medium hover:underline"
        >
          Seguir comprando
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Package className="w-7 h-7 text-gray-300" />
          </div>
          <p className="font-semibold text-gray-700 mb-1">Todavía no tenés pedidos</p>
          <p className="text-sm text-gray-400 mb-5">
            Cuando realices una compra, aparecerá acá
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#1E3A8A] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-800 transition-colors"
          >
            Explorar productos
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => {
            const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
            const StatusIcon = cfg.icon;
            const preview = order.items
              .slice(0, 2)
              .map((i) => i.name)
              .join(", ");
            const extra = order.items.length > 2 ? ` y ${order.items.length - 2} más` : "";
            const totalQty = order.items.reduce((a, i) => a + i.quantity, 0);

            return (
              <li
                key={order._id}
                className="border border-gray-100 rounded-xl p-4 hover:border-blue-200 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="font-semibold text-sm text-gray-900 font-mono">
                      #{order.orderNumber}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString("es-AR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                      {" · "}
                      {totalQty} artículo{totalQty !== 1 ? "s" : ""}
                    </p>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 ${cfg.pill}`}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {cfg.label}
                  </span>
                </div>

                <p className="text-xs text-gray-500 line-clamp-1 mb-3">
                  {preview}{extra}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <span className="font-bold text-gray-900">
                    ${order.total.toLocaleString("es-AR")}
                  </span>
                  <Link
                    href={`/account/orders/${order._id}`}
                    className="flex items-center gap-1.5 text-xs text-[#1E3A8A] font-semibold hover:underline"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Ver detalle
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
