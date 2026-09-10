"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { FormSelect } from "@/shared/components/FormSelect";
import { errorToast, successToast } from "@/core/core.function";
import { unassignVehicleFromPurchaseRequestQuote } from "../lib/purchaseRequestQuote.actions";
import { PurchaseRequestQuoteResource } from "../lib/purchaseRequestQuote.interface";

interface UnassignVehicleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: PurchaseRequestQuoteResource;
  onSuccess: () => void | Promise<unknown>;
}

type UnassignMode = "keep" | "close";

const MODE_OPTIONS = [
  {
    value: "keep",
    label: "Solo desasignar el vehículo",
    description: "La solicitud queda abierta y se le puede asignar otro VIN.",
  },
  {
    value: "close",
    label: "Desasignar y cerrar la solicitud",
    description:
      "Además de quitar el VIN, la solicitud se cierra por completo y la oportunidad asociada pasa a estado CERRADA.",
  },
];

export default function UnassignVehicleModal({
  open,
  onOpenChange,
  quote,
  onSuccess,
}: UnassignVehicleModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<{ mode: UnassignMode }>({
    defaultValues: { mode: "keep" },
  });

  const mode = form.watch("mode");

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  const handleConfirm = async () => {
    if (!quote.ap_vehicle_id) return;
    setIsSubmitting(true);
    try {
      await unassignVehicleFromPurchaseRequestQuote(
        quote.id,
        quote.ap_vehicle_id,
        mode === "close",
      );
      await onSuccess();
      successToast(
        mode === "close"
          ? "Vehículo desvinculado y solicitud cerrada correctamente"
          : "Vehículo desvinculado correctamente",
      );
      handleClose();
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(msg || "Error al desvincular el vehículo");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GeneralModal
      open={open}
      onClose={handleClose}
      title="Desasignar vehículo"
      subtitle={`Solicitud ${quote.correlative}`}
      icon="Link2Off"
      size="lg"
      childrenFooter={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            variant={mode === "close" ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : mode === "close" ? (
              "Desasignar y cerrar"
            ) : (
              "Desasignar"
            )}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
          Elige qué hacer con la solicitud después de quitar el vehículo
          asignado.
        </div>

        <Form {...form}>
          <FormSelect
            control={form.control}
            name="mode"
            label="¿Qué deseas hacer?"
            placeholder="Selecciona una opción"
            description={
              MODE_OPTIONS.find((o) => o.value === mode)?.description
            }
            options={MODE_OPTIONS}
          />
        </Form>
      </div>
    </GeneralModal>
  );
}
