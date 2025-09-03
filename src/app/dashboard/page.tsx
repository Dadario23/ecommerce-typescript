// app/dashboard/page.tsx - Overview principal
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  LucideIcon,
} from "lucide-react";

interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
}

interface Trend {
  value: number;
  isPositive: boolean;
}

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: Trend;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Simular llamada a API
      setTimeout(() => {
        setStats({
          totalSales: 12458,
          totalOrders: 156,
          totalCustomers: 89,
          totalProducts: 42,
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching stats:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className=" flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <span className="text-sm text-gray-500">Última actualización: hoy</span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Ventas Totales"
          value={`$${stats.totalSales.toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatCard
          title="Órdenes"
          value={stats.totalOrders.toString()}
          icon={ShoppingCart}
          trend={{ value: 8.2, isPositive: true }}
        />
        <StatCard
          title="Clientes"
          value={stats.totalCustomers.toString()}
          icon={Users}
          trend={{ value: 5.7, isPositive: true }}
        />
        <StatCard
          title="Productos"
          value={stats.totalProducts.toString()}
          icon={Package}
          trend={{ value: 3.4, isPositive: true }}
        />
      </div>

      {/* Sección de gráficos y datos adicionales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ventas Mensuales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Gráfico de ventas mensuales</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Órdenes Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Lista de órdenes recientes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center">
                <ShoppingCart className="h-8 w-8 text-blue-500 mr-4" />
                <div>
                  <h3 className="font-semibold">Gestionar Órdenes</h3>
                  <p className="text-sm text-gray-500">
                    Ver y procesar órdenes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-green-500 mr-4" />
                <div>
                  <h3 className="font-semibold">Gestionar Productos</h3>
                  <p className="text-sm text-gray-500">
                    Agregar/editar productos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-500 mr-4" />
                <div>
                  <h3 className="font-semibold">Gestionar Clientes</h3>
                  <p className="text-sm text-gray-500">
                    Ver clientes y estadísticas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Componente de tarjeta de estadísticas
function StatCard({ title, value, icon: Icon, trend }: StatCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <Icon className="h-5 w-5 text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {trend && (
          <p
            className={`text-xs mt-1 ${
              trend.isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend.isPositive ? "↑" : "↓"} {trend.value}% vs mes anterior
          </p>
        )}
      </CardContent>
    </Card>
  );
}
