import { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Eye, XCircle } from "lucide-react";
import { useInventoryMovementById } from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventory.hook.ts";
import InventoryMovementDetailsSheet from "./InventoryMovementDetailsSheet.tsx";
import DiscardMovementModal from "./DiscardMovementModal.tsx";

interface InventoryMovementActionsProps {
  // De la fila solo se usa el id: el detalle se pide al endpoint show.
  movement: { id: number; movement_number?: string | null };
  canDiscard?: boolean;
}

export default function InventoryMovementActions({
  movement,
  canDiscard = false,
}: InventoryMovementActionsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);

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
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDialogOpen(true)}
          className="h-8 w-8 p-0"
          tooltip="Ver detalles"
        >
          <Eye className="h-4 w-4" />
        </Button>
        {canDiscard && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDiscardOpen(true)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            tooltip="Descartar movimiento"
          >
            <XCircle className="h-4 w-4" />
          </Button>
        )}
      </div>
      <InventoryMovementDetailsSheet
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        movement={detailedMovement}
        isLoading={loading}
      />
      {canDiscard && (
        <DiscardMovementModal
          open={discardOpen}
          onClose={() => setDiscardOpen(false)}
          movementId={movement.id}
          movementNumber={movement.movement_number}
        />
      )}
    </>
  );
}
