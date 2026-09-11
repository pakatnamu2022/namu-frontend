"use client";

import { useForm } from "react-hook-form";
import { Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { FormSelect } from "@/shared/components/FormSelect";
import { EMPRESA_AP } from "@/core/core.constants";
import { errorToast, successToast } from "@/core/core.function";
import { useAllSedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import { useWorkerConfig } from "@/features/ap/configuraciones/ventas/asignar-marca/lib/assignBrandConsultant.hook";
import { useChangeSedePurchaseRequestQuote } from "../lib/purchaseRequestQuote.hook";
import { PurchaseRequestQuoteResource } from "../lib/purchaseRequestQuote.interface";

interface ChangeSedeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: PurchaseRequestQuoteResource;
}

export default function ChangeSedeModal({
  open,
  onOpenChange,
  quote,
}: ChangeSedeModalProps) {
  const { data: sedes = [] } = useAllSedes({ empresa_id: EMPRESA_AP.id });
  const changeSedeMutation = useChangeSedePurchaseRequestQuote();

  // Sedes que el asesor de la oportunidad tiene asignadas en el período actual
  // (asignación sede-asesor). Si la solicitud tiene asesor, solo se puede mover
  // a una de esas sedes.
  const workerId = quote.consultant?.id;
  const { data: workerConfig } = useWorkerConfig(workerId);
  const allowedSedeIds =
    workerId && workerConfig?.sedes?.length
      ? workerConfig.sedes.map((s) => s.id)
      : null;

  const form = useForm<{ sede_id: string }>({
    defaultValues: { sede_id: quote.sede_id ? String(quote.sede_id) : "" },
  });

  const selectedSedeId = form.watch("sede_id");
  const currentSede = sedes.find((s) => s.id === quote.sede_id);
  // Solo se puede mover la solicitud entre sedes de la misma tienda (shop) que
  // la sede actual. Si la sede actual no tiene shop_id, no hay destinos válidos.
  const sedeOptions = sedes.filter(
    (s) =>
      s.id !== quote.sede_id &&
      currentSede?.shop_id != null &&
      s.shop_id === currentSede.shop_id &&
      (allowedSedeIds === null || allowedSedeIds.includes(s.id)),
  );
  const selectedSede = sedes.find((s) => String(s.id) === selectedSedeId);
  const isSameSede = String(quote.sede_id ?? "") === selectedSedeId;

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  const handleChangeSede = async () => {
    if (!selectedSedeId) {
      errorToast("Selecciona la sede de destino");
      return;
    }
    if (isSameSede) {
      errorToast("La solicitud ya pertenece a la sede seleccionada");
      return;
    }

    try {
      await changeSedeMutation.mutateAsync({
        id: quote.id,
        sede_id: Number(selectedSedeId),
      });
      successToast("Sede cambiada correctamente");
      handleClose();
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(msg || "Error al cambiar la sede");
    }
  };

  return (
    <GeneralModal
      open={open}
      onClose={handleClose}
      title="Cambiar sede de la solicitud"
      subtitle={`Solicitud ${quote.correlative}`}
      icon="MapPin"
      size="lg"
      childrenFooter={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleChangeSede}
            disabled={
              !selectedSedeId || isSameSede || changeSedeMutation.isPending
            }
          >
            {changeSedeMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cambiando...
              </>
            ) : (
              "Confirmar cambio"
            )}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
          Al cambiar la sede de esta solicitud también se actualiza la sede del{" "}
          <span className="font-medium text-foreground">lead</span> de la
          oportunidad asociada, para mantener la coherencia con la asignación
          asesor–sede.{" "}
          {allowedSedeIds !== null
            ? "Solo se listan las sedes que el asesor de la oportunidad tiene asignadas en el período actual (y de la misma tienda)."
            : "Solo se permite mover la solicitud a sedes de la misma tienda."}{" "}
          No se puede cambiar si ya está pagada o tiene un vehículo (VIN)
          asignado.
        </div>

        <div className="flex items-center justify-center gap-3 text-sm">
          <div className="flex flex-col items-center">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">
              Sede actual
            </span>
            <span className="font-semibold">{quote.sede ?? "—"}</span>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="flex flex-col items-center">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">
              Sede destino
            </span>
            <span className="font-semibold text-primary">
              {selectedSede && !isSameSede ? selectedSede.abreviatura : "—"}
            </span>
          </div>
        </div>

        <Form {...form}>
          <FormSelect
            control={form.control}
            name="sede_id"
            label="Nueva sede"
            placeholder="Selecciona una sede"
            description="La solicitud y el lead de la oportunidad quedarán registrados en esta sede."
            isSearchable
            required
            options={sedeOptions.map((sede) => ({
              label: sede.abreviatura,
              value: String(sede.id),
            }))}
          />
          {currentSede && sedeOptions.length === 0 && (
            <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
              {allowedSedeIds !== null
                ? "El asesor de la oportunidad no tiene otras sedes asignadas en la misma tienda para el período actual."
                : "No hay otras sedes en la misma tienda que la sede actual."}
            </p>
          )}
        </Form>
      </div>
    </GeneralModal>
  );
}
