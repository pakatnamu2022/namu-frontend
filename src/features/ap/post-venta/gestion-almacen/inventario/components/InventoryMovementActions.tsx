import { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Eye } from "lucide-react";
import { useInventoryMovementById } from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventory.hook.ts";
import InventoryMovementDetailsSheet from "./InventoryMovementDetailsSheet.tsx";

interface InventoryMovementActionsProps {
  // De la fila solo se usa el id: el detalle se pide al endpoint show.
  movement: { id: number };
}

export default function InventoryMovementActions({
  movement,
}: InventoryMovementActionsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  // El detalle se consulta al endpoint show con el id; la API arma la
  // respuesta según el reference_type del movimiento. De la fila solo se
  // usa el id, nunca para pintar el detalle.
  const { data, isLoading } = useInventoryMovementById(
    dialogOpen ? movement.id : null,
  );

  const detailedMovement = data?.data ?? null;
  // Solo mostramos el skeleton mientras no tengamos la respuesta del show.
  const loading = dialogOpen && isLoading && !detailedMovement;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setDialogOpen(true)}
        className="h-8 w-8 p-0"
        tooltip="Ver detalles"
      >
        <Eye className="h-4 w-4" />
      </Button>
      <InventoryMovementDetailsSheet
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        movement={detailedMovement}
        isLoading={loading}
      />
    </>
  );
}
