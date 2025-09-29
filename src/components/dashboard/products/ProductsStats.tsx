// src/components/dashboard/products/ProductsStats.tsx
import { StatCard } from "../shared/StatCard";
import { Grid, Eye, AlertCircle, Package } from "lucide-react";

interface ProductsStatsProps {
  total: number;
  active: number;
  outOfStock: number;
  lowStock: number;
}

export function ProductsStats({
  total,
  active,
  outOfStock,
  lowStock,
}: ProductsStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        title="Total Productos"
        value={total}
        icon={<Grid className="h-4 w-4 text-muted-foreground" />}
      />
      <StatCard
        title="Productos Activos"
        value={active}
        icon={<Eye className="h-4 w-4 text-muted-foreground" />}
      />
      <StatCard
        title="Sin Stock"
        value={outOfStock}
        icon={<AlertCircle className="h-4 w-4 text-muted-foreground" />}
      />
      <StatCard
        title="Stock Bajo"
        value={lowStock}
        icon={<Package className="h-4 w-4 text-muted-foreground" />}
      />
    </div>
  );
}
