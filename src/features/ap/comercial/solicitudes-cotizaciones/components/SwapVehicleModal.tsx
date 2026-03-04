"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Form } from "@/components/ui/form";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { useVehicleById, useVehicles } from "../../vehiculos/lib/vehicles.hook";
import { useSwapVehiclePurchaseRequestQuote } from "../lib/purchaseRequestQuote.hook";
import { VehicleResource } from "../../vehiculos/lib/vehicles.interface";
import { ArrowDownUp, Loader2 } from "lucide-react";
import { errorToast, successToast } from "@/core/core.function";
import { PurchaseRequestQuoteResource } from "../lib/purchaseRequestQuote.interface";

interface SwapVehicleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: PurchaseRequestQuoteResource;
}

function VehicleCard({
  vehicle,
  variant,
}: {
  vehicle: VehicleResource;
  variant: "current" | "new";
}) {
  return (
    <div
      className={`flex items-start gap-3 px-3 py-2.5 border rounded-lg ${
        variant === "current"
          ? "border-amber-400 bg-amber-50 dark:bg-amber-950/20"
          : "border-primary bg-primary/5 shadow-sm"
      }`}
    >
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm font-mono leading-tight tracking-wide truncate">
          {vehicle.vin}
        </p>
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          <span className="text-xs text-foreground/80 font-medium truncate">
            {vehicle.model?.version}
          </span>
          {vehicle.model?.code && (
            <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0">
              {vehicle.model.code}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1 mt-1 text-[11px] text-muted-foreground flex-wrap">
          <span>{vehicle.year}</span>
          <span className="opacity-40">·</span>
          <span>{vehicle.vehicle_color}</span>
          <span className="opacity-40">·</span>
          <span>{vehicle.engine_type}</span>
          {vehicle.warehouse_name && (
            <>
              <span className="opacity-40">·</span>
              <span>{vehicle.warehouse_name}</span>
            </>
          )}
        </div>
        <div className="mt-1">
          <span
            className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium"
            style={{
              backgroundColor: `${vehicle.status_color}20`,
              color: vehicle.status_color,
            }}
          >
            {vehicle.vehicle_status}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function SwapVehicleModal({
  open,
  onOpenChange,
  quote,
}: SwapVehicleModalProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleResource | null>(null);

  const { data: currentVehicle, isLoading: isLoadingCurrent } = useVehicleById(
    quote.ap_vehicle_id ?? 0
  );

  const form = useForm<{ ap_vehicle_id: string }>({
    defaultValues: { ap_vehicle_id: "" },
  });

  const swapMutation = useSwapVehiclePurchaseRequestQuote();

  const handleSwap = async () => {
    const vehicleId = form.getValues("ap_vehicle_id");
    if (!vehicleId) {
      errorToast("Por favor selecciona un vehículo nuevo");
      return;
    }

    try {
      await swapMutation.mutateAsync({
        id: quote.id,
        ap_vehicle_id: Number(vehicleId),
      });
      successToast("Vehículo cambiado correctamente");
      handleClose();
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(msg || "Error al cambiar el vehículo");
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
    setSelectedVehicle(null);
  };

  const selectedVehicleId = form.watch("ap_vehicle_id");

  return (
    <GeneralModal
      open={open}
      onClose={handleClose}
      title="Cambiar vehículo"
      subtitle="Selecciona un nuevo vehículo para reemplazar el actual en esta cotización"
      icon="ArrowLeftRight"
      size="2xl"
      childrenFooter={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSwap}
            disabled={!selectedVehicleId || swapMutation.isPending}
          >
            {swapMutation.isPending ? (
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
        {/* Current vehicle */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Vehículo actual
          </p>
          {isLoadingCurrent ? (
            <div className="flex items-center justify-center py-4 border rounded-lg border-amber-400 bg-amber-50 dark:bg-amber-950/20">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : currentVehicle ? (
            <VehicleCard vehicle={currentVehicle} variant="current" />
          ) : null}
        </div>

        {/* Swap indicator */}
        <div className="flex items-center justify-center gap-3 text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          <ArrowDownUp className="h-4 w-4 shrink-0" />
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Vehicle selector + preview */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Nuevo vehículo
          </p>
          <Form {...form}>
            <div className="space-y-3">
              <FormSelectAsync
                control={form.control}
                name="ap_vehicle_id"
                placeholder="Buscar vehículo por VIN, modelo..."
                useQueryHook={useVehicles}
                mapOptionFn={(v: VehicleResource) => ({
                  value: String(v.id),
                  label: v.vin,
                  description: `${v.model?.version ?? ""} · ${v.year} · ${v.vehicle_color}`,
                })}
                additionalParams={{
                  ap_vehicle_status_id: [2, 5],
                  has_purchase_request_quote: 0,
                  // ap_models_vn_id: quote.ap_models_vn_id,
                  warehouse$sede_id: quote.sede_id,
                  
                }}
                onValueChange={(_value, item) => {
                  setSelectedVehicle(item ?? null);
                }}
                allowClear
              />

              {selectedVehicle && (
                <VehicleCard vehicle={selectedVehicle} variant="new" />
              )}
            </div>
          </Form>
        </div>
      </div>
    </GeneralModal>
  );
}
