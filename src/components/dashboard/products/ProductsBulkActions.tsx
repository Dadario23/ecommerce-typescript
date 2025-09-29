// src/components/dashboard/products/ProductsBulkActions.tsx
import { Button } from "@/components/ui/button";
import { Check, X, Trash2 } from "lucide-react";

interface ProductsBulkActionsProps {
  selectedCount: number;
  onActivate: () => void;
  onDeactivate: () => void;
  onDelete: () => void;
}

export function ProductsBulkActions({
  selectedCount,
  onActivate,
  onDeactivate,
  onDelete,
}: ProductsBulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 bg-muted rounded-lg mb-4">
      <span className="text-sm font-medium">
        {selectedCount} producto(s) seleccionado(s)
      </span>
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:ml-auto">
        <Button variant="outline" size="sm" onClick={onActivate}>
          <Check className="h-4 w-4 mr-1" />
          Activar
        </Button>
        <Button variant="outline" size="sm" onClick={onDeactivate}>
          <X className="h-4 w-4 mr-1" />
          Desactivar
        </Button>
        <Button variant="outline" size="sm" onClick={onDelete}>
          <Trash2 className="h-4 w-4 mr-1" />
          Eliminar
        </Button>
      </div>
    </div>
  );
}
