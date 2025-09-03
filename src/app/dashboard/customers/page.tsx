// src/app/dashboard/customers/page.tsx
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

interface Customer {
  id: string;
  name: string;
  email: string;
  orders: number;
}

const mockCustomers: Customer[] = [
  { id: "C001", name: "Juan Pérez", email: "juan@example.com", orders: 5 },
  { id: "C002", name: "María López", email: "maria@example.com", orders: 2 },
  { id: "C003", name: "Pedro Gómez", email: "pedro@example.com", orders: 7 },
];

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [showDetails, setShowDetails] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleDelete = () => {
    if (selectedCustomer) {
      setCustomers((prev) => prev.filter((c) => c.id !== selectedCustomer.id));
    }
    setShowConfirmDelete(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Órdenes</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.id}</TableCell>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.orders}</TableCell>
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
                            setSelectedCustomer(customer);
                            setShowDetails(true);
                          }}
                        >
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            alert(`Editar cliente ${customer.name}`)
                          }
                        >
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setSelectedCustomer(customer);
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
        title={`Detalles del Cliente`}
      >
        <p>
          <strong>Nombre:</strong> {selectedCustomer?.name}
        </p>
        <p>
          <strong>Email:</strong> {selectedCustomer?.email}
        </p>
        <p>
          <strong>Órdenes realizadas:</strong> {selectedCustomer?.orders}
        </p>
      </DetailsDialog>

      {/* Confirm Delete Modal */}
      <ConfirmDialog
        open={showConfirmDelete}
        onOpenChange={setShowConfirmDelete}
        title="Eliminar Cliente"
        description={`¿Seguro que quieres eliminar al cliente ${selectedCustomer?.name}? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
