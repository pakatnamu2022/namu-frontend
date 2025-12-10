import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { InventoryMovementResource } from "../lib/inventoryMovements.interface";
import InventoryMovementDetailsSheet from "./InventoryMovementDetailsSheet";

interface InventoryMovementActionsProps {
  movement: InventoryMovementResource;
}

export default function InventoryMovementActions({
  movement,
}: InventoryMovementActionsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  // Verificar si el movimiento tiene referencia para habilitar el botón
  const hasReference =
    movement.reference !== null && movement.reference !== undefined;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setDialogOpen(true)}
        className="h-8 w-8 p-0"
        disabled={!hasReference}
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
