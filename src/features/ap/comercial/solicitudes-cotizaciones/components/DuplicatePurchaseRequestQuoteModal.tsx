"use client";

import { useState } from "react";
import { Copy, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { errorToast, successToast } from "@/core/core.function";
import { useDuplicatePurchaseRequestQuote } from "../lib/purchaseRequestQuote.hook";
import { PurchaseRequestQuoteResource } from "../lib/purchaseRequestQuote.interface";

interface Props {
  quote: PurchaseRequestQuoteResource;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MAX_COPIES = 20;

export default function DuplicatePurchaseRequestQuoteModal({
  quote,
  open,
  onOpenChange,
}: Props) {
  const [copies, setCopies] = useState(1);
  const { mutateAsync, isPending } = useDuplicatePurchaseRequestQuote();

  const isValid = Number.isInteger(copies) && copies >= 1 && copies <= MAX_COPIES;

  const handleConfirm = async () => {
    if (!isValid) return;
    try {
      const res = await mutateAsync({ id: quote.id, copies });
      successToast(res.message ?? "Solicitudes generadas correctamente");
      onOpenChange(false);
      setCopies(1);
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ?? "No se pudieron generar las solicitudes",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !isPending && onOpenChange(o)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="size-4" />
            Duplicar solicitud
          </DialogTitle>
          <DialogDescription>
            Se generarán nuevas solicitudes de compra idénticas a la{" "}
            <span className="font-semibold">{quote.correlative}</span> (mismo
            titular, modelo, color, precio, bonos y accesorios). Cada copia nace
            sin VIN, sin aprobar y sin facturar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="copies">Cantidad de copias</Label>
          <Input
            id="copies"
            type="number"
            min={1}
            max={MAX_COPIES}
            value={copies}
            onChange={(e) =>
              setCopies(Math.floor(Number(e.target.value)) || 0)
            }
            autoFocus
          />
          {!isValid && (
            <p className="text-xs text-destructive">
              Ingresa un número entre 1 y {MAX_COPIES}.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!isValid || isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Generar {isValid ? copies : ""}{" "}
            {copies === 1 ? "copia" : "copias"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
