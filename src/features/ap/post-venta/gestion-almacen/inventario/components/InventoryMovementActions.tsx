import { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Eye } from "lucide-react";
import { InventoryMovementResource } from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventoryMovements.interface.ts";
import InventoryMovementDetailsSheet from "./InventoryMovementDetailsSheet.tsx";

interface InventoryMovementActionsProps {
  movement: InventoryMovementResource;
}

export default function InventoryMovementActions({
  movement,
}: InventoryMovementActionsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  // Verificar si el movimiento tiene información para mostrar
  const hasDetails =
    movement.reference !== null ||
    movement.reference !== undefined ||
    movement.reason_in_out !== null ||
    movement.reason_in_out !== undefined;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setDialogOpen(true)}
        className="h-8 w-8 p-0"
        disabled={!hasDetails}
        tooltip={hasDetails ? "Ver detalles" : "Sin detalles disponibles"}
      >
        <Eye className="h-4 w-4" />
      </Button>
      <InventoryMovementDetailsSheet
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        movement={movement}
      />
    </>
  );
}
