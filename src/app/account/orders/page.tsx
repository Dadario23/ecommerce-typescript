// app/account/orders/page.tsx - ACTUALIZADO
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Clock, Truck, CheckCircle, XCircle } from "lucide-react";

interface Order {
  _id: string;
  orderNumber: string;
  createdAt: string;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  total: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetchUserOrders();
    }
  }, [status]);

  const fetchUserOrders = async () => {
    try {
      const res = await fetch("/api/orders/user"); // ← Cambiado a /api/orders/user
      if (res.ok) {
        const ordersData = await res.json();
        setOrders(ordersData);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "shipped":
      case "processing":
        return <Truck className="w-4 h-4 text-blue-600" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: "Pendiente",
      confirmed: "Confirmado",
      processing: "Procesando",
      shipped: "En camino",
      delivered: "Entregado",
      cancelled: "Cancelado",
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      processing: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colorMap[status] || "bg-gray-100 text-gray-800";
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-2xl font-bold mb-6">Historial de pedidos</h3>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border rounded-lg p-6 h-32 bg-gray-100"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-bold mb-4">Acceso requerido</h3>
        <p className="text-gray-600 mb-4">Inicia sesión para ver tus pedidos</p>
        <Button asChild>
          <Link href="/login">Iniciar sesión</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold">Historial de pedidos</h3>
        <Button variant="outline" asChild>
          <Link href="/">Seguir comprando</Link>
        </Button>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Truck className="w-16 h-16 mx-auto" />
            </div>
            <h4 className="text-lg font-semibold text-gray-600 mb-2">
              No tienes pedidos realizados
            </h4>
            <p className="text-gray-500 mb-4">
              ¡Explora nuestros productos y realiza tu primera compra!
            </p>
            <Button asChild>
              <Link href="/">Comenzar a comprar</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">
                        Pedido #{order.orderNumber}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-500">
                      Fecha:{" "}
                      {new Date(order.createdAt).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.items.reduce(
                        (total, item) => total + item.quantity,
                        0
                      )}{" "}
                      producto(s)
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      <div className="flex items-center gap-1">
                        {getStatusIcon(order.status)}
                        {getStatusText(order.status)}
                      </div>
                    </span>
                    <p className="text-lg font-bold">
                      ${order.total.toLocaleString("es-ES")}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    {order.items.slice(0, 2).map((item, index) => (
                      <span key={index}>
                        {item.name}
                        {index < order.items.length - 1 && ", "}
                      </span>
                    ))}
                    {order.items.length > 2 &&
                      ` y ${order.items.length - 2} más`}
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/account/orders/${order._id}`}>
                      <Eye className="w-4 h-4 mr-2" />
                      Ver detalle
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
