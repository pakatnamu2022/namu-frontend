import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Label } from "@/components/ui/label.tsx";
import { successToast, errorToast } from "@/core/core.function";
import { useMarkDefectiveProducts } from "../lib/receptionsProducts.hook.ts";
import { ReceptionDetailResource } from "../lib/receptionsProducts.interface.ts";
import { translateReasonObservation } from "@/features/ap/post-venta/gestion-almacen/recepcion-transferencia/lib/transferReception.constants.ts";
import { FormInput } from "@/shared/components/FormInput.tsx";
import { SearchableSelect } from "@/shared/components/SearchableSelect.tsx";

const REASON_OPTIONS = [
  "DAMAGED",
  "DEFECTIVE",
  "EXPIRED",
  "WRONG_PRODUCT",
  "WRONG_QUANTITY",
  "POOR_QUALITY",
  "OTHER",
] as const;

interface Props {
  open: boolean;
  onClose: () => void;
  detail: ReceptionDetailResource | null;
  onSuccess?: () => void;
}

export default function MarkDefectiveProductDialog({
  open,
  onClose,
  detail,
  onSuccess,
}: Props) {
  const [quantity, setQuantity] = useState<number | "">("");
  const [reason, setReason] = useState<string>("");

  const { mutate: markDefective, isPending } = useMarkDefectiveProducts();

  const maxQuantity = detail ? Number(detail.quantity_received) : undefined;

  const resetForm = () => {
    setQuantity("");
    setReason("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    if (!detail) return;

    const parsedQuantity = Number(quantity);
    if (!quantity || isNaN(parsedQuantity) || parsedQuantity <= 0) {
      errorToast("Ingrese una cantidad defectuosa válida");
      return;
    }
    if (maxQuantity !== undefined && parsedQuantity > maxQuantity) {
      errorToast("La cantidad defectuosa no puede superar la cantidad recibida");
      return;
    }
    if (!reason) {
      errorToast("Seleccione un motivo");
      return;
    }

    markDefective(
      {
        items: [
          {
            reception_detail_id: detail.id,
            defective_quantity: parsedQuantity,
            reason_observation: reason,
          },
        ],
      },
      {
        onSuccess: () => {
          successToast("Producto marcado como defectuoso correctamente");
          onSuccess?.();
          handleClose();
        },
        onError: (error: any) => {
          const msg =
            error?.response?.data?.message ||
            "Error al marcar el producto como defectuoso";
          errorToast(msg);
        },
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Marcar Producto Defectuoso</DialogTitle>
          <DialogDescription>
            {detail?.product?.name || "Repuesto"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <FormInput
            name="defective_quantity"
            label="Cantidad Defectuosa"
            type="number"
            min={0.01}
            max={maxQuantity}
            step="0.01"
            value={quantity}
            onChange={(e) =>
              setQuantity(e.target.value === "" ? "" : Number(e.target.value))
            }
            placeholder="0.00"
            description={
              maxQuantity !== undefined
                ? `Cantidad recibida: ${maxQuantity}`
                : undefined
            }
            required
          />

          <div className="flex flex-col gap-1">
            <Label
              htmlFor="defective-reason"
              className="text-xs md:text-sm font-medium text-muted-foreground"
            >
              Motivo
            </Label>
            <SearchableSelect
              value={reason}
              onChange={setReason}
              placeholder="Seleccione un motivo"
              buttonSize="sm"
              options={REASON_OPTIONS.map((option) => ({
                value: option,
                label: translateReasonObservation(option),
              }))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Guardando..." : "Marcar Defectuoso"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
