import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Loader } from "lucide-react";
import { useIgnoreInventoryMovement } from "@/features/ap/post-venta/gestion-almacen/inventario/lib/inventory.hook.ts";

interface DiscardMovementModalProps {
  open: boolean;
  onClose: () => void;
  movementId: number;
  movementNumber?: string | null;
}

export default function DiscardMovementModal({
  open,
  onClose,
  movementId,
  movementNumber,
}: DiscardMovementModalProps) {
  const [reason, setReason] = useState("");
  const { mutate: discard, isPending } = useIgnoreInventoryMovement();

  const handleClose = () => {
    setReason("");
    onClose();
  };

  const handleConfirm = () => {
    discard(
      { id: movementId, reason: reason.trim() || null },
      { onSuccess: handleClose },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Descartar movimiento</DialogTitle>
          <DialogDescription>
            El movimiento{movementNumber ? ` ${movementNumber}` : ""} dejará de
            contar en el kardex del producto. Podrás revertirlo más adelante
            desde "Movimientos descartados".
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="discard-reason">Motivo (opcional)</Label>
          <Textarea
            id="discard-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ingrese el motivo del descarte..."
            rows={3}
            maxLength={1000}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Descartando..." : "Descartar movimiento"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
