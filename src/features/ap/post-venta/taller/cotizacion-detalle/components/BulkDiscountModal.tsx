import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "lucide-react";
import { errorToast, successToast } from "@/core/core.function";
import { applyBulkDiscountOrderQuotation } from "../../cotizacion/lib/proforma.actions";
import { ORDER_QUOTATION_DETAILS } from "../lib/proformaDetails.constants";

interface BulkDiscountModalProps {
  open: boolean;
  onClose: () => void;
  quotationId: number;
  type: "labor" | "product";
  maxDiscount: number;
  onSuccess?: () => Promise<void> | void;
}

export default function BulkDiscountModal({
  open,
  onClose,
  quotationId,
  type,
  maxDiscount,
  onSuccess,
}: BulkDiscountModalProps) {
  const queryClient = useQueryClient();
  const [discountPercentage, setDiscountPercentage] = useState("");

  useEffect(() => {
    if (open) setDiscountPercentage("");
  }, [open]);

  const pct = Number(discountPercentage || 0);
  const isInvalid =
    discountPercentage === "" ||
    Number.isNaN(pct) ||
    pct < 0 ||
    pct > 100 ||
    pct > maxDiscount;

  const { mutate: applyDiscount, isPending } = useMutation({
    mutationFn: () =>
      applyBulkDiscountOrderQuotation(quotationId, {
        type,
        discount_percentage: pct,
      }),
    onSuccess: async () => {
      successToast("Descuento aplicado correctamente a todos los ítems");
      queryClient.invalidateQueries({
        queryKey: [ORDER_QUOTATION_DETAILS.QUERY_KEY],
      });
      await onSuccess?.();
      handleClose();
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Error al aplicar el descuento";
      errorToast(message);
    },
  });

  const handleClose = () => {
    setDiscountPercentage("");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isInvalid) return;
    applyDiscount();
  };

  const label = type === "labor" ? "mano de obra" : "repuestos";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Descuento masivo</DialogTitle>
          <DialogDescription>
            Se aplicará el mismo porcentaje de descuento a todos los ítems de{" "}
            {label}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="bulk-discount-percentage">
              Porcentaje de descuento
            </Label>
            <div className="relative">
              <Input
                id="bulk-discount-percentage"
                type="number"
                min={0}
                max={100}
                step="0.01"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(e.target.value)}
                placeholder="0.00"
                autoFocus
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                %
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Tu descuento máximo permitido es{" "}
              <span className="font-semibold text-foreground">
                {maxDiscount.toFixed(2)}%
              </span>
              .
            </p>
            {discountPercentage !== "" && pct > maxDiscount && (
              <p className="text-xs text-destructive font-medium">
                El descuento no puede superar el {maxDiscount.toFixed(2)}%
                permitido.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending || isInvalid}>
              {isPending && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? "Aplicando..." : "Aplicar descuento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
