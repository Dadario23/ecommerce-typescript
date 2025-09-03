// src/app/dashboard/orders/page.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";
import DetailsDialog from "@/components/DetailsDialog";

interface Order {
  id: string;
  customer: string;
  total: number;
  status: "Pendiente" | "Completada" | "Cancelada";
}

const mockOrders: Order[] = [
  { id: "001", customer: "Juan Pérez", total: 120, status: "Pendiente" },
  { id: "002", customer: "María López", total: 340, status: "Completada" },
  { id: "003", customer: "Pedro Gómez", total: 85, status: "Cancelada" },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);

  // Modals state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleDelete = () => {
    if (selectedOrder) {
      setOrders((prev) => prev.filter((o) => o.id !== selectedOrder.id));
    }
    setShowConfirmDelete(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Órdenes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>${order.total}</TableCell>
                  <TableCell>{order.status}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowDetails(true);
                          }}
                        >
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => alert(`Editar orden ${order.id}`)}
                        >
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowConfirmDelete(true);
                          }}
                        >
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Details Modal */}
      <DetailsDialog
        open={showDetails}
        onOpenChange={setShowDetails}
        title={`Detalles de la Orden #${selectedOrder?.id}`}
      >
        <p>
          <strong>Cliente:</strong> {selectedOrder?.customer}
        </p>
        <p>
          <strong>Total:</strong> ${selectedOrder?.total}
        </p>
        <p>
          <strong>Estado:</strong> {selectedOrder?.status}
        </p>
      </DetailsDialog>

      {/* Confirm Delete Modal */}
      <ConfirmDialog
        open={showConfirmDelete}
        onOpenChange={setShowConfirmDelete}
        title="Eliminar Orden"
        description={`¿Seguro que quieres eliminar la orden #${selectedOrder?.id}? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
