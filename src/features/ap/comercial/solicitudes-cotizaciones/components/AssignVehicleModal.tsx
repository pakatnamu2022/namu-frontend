"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { useAllVehicles } from "../../vehiculos/lib/vehicles.hook";
import { useAssignVehicleToPurchaseRequestQuote } from "../lib/purchaseRequestQuote.hook";
import { VehicleResource } from "../../vehiculos/lib/vehicles.interface";
import { Loader2 } from "lucide-react";
import { errorToast, successToast } from "@/core/core.function";
import { PurchaseRequestQuoteResource } from "../lib/purchaseRequestQuote.interface";

interface AssignVehicleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: PurchaseRequestQuoteResource;
}

export default function AssignVehicleModal({
  open,
  onOpenChange,
  quote,
}: AssignVehicleModalProps) {
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(
    null
  );

  const { data: vehicles, isLoading } = useAllVehicles({
    ap_vehicle_status_id: [2, 5],
    has_purchase_request_quote: 0,
    ap_models_vn_id: quote.ap_models_vn_id,
    warehouse$sede_id: quote.sede_id,
  });

  const assignVehicleMutation = useAssignVehicleToPurchaseRequestQuote();

  const handleAssignVehicle = async () => {
    if (!selectedVehicleId) {
      errorToast("Por favor selecciona un vehículo");
      return;
    }

    try {
      await assignVehicleMutation.mutateAsync({
        id: quote.id,
        ap_vehicle_id: selectedVehicleId,
      });
      successToast("Vehículo asignado correctamente");
      onOpenChange(false);
      setSelectedVehicleId(null);
    } catch (error) {
      errorToast("Error al asignar el vehículo");
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setSelectedVehicleId(null);
  };

  return (
    <GeneralModal
      open={open}
      onClose={handleClose}
      title="Asignar vehículo a cotización"
      subtitle="Selecciona un vehículo disponible para asignar a esta cotización"
      icon="Car"
      size="3xl"
      childrenFooter={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleAssignVehicle}
            disabled={!selectedVehicleId || assignVehicleMutation.isPending}
          >
            {assignVehicleMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Asignando...
              </>
            ) : (
              "Asignar vehículo"
            )}
          </Button>
        </div>
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : vehicles && vehicles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {vehicles.map((vehicle: VehicleResource) => {
            const isSelected = selectedVehicleId === vehicle.id;
            return (
              <div
                key={vehicle.id}
                className={`flex items-start gap-3 px-3 py-2.5 border rounded-lg cursor-pointer transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/40 hover:bg-muted/30"
                }`}
                onClick={() => setSelectedVehicleId(vehicle.id)}
              >
                {/* Radio indicator */}
                <div
                  className={`mt-0.5 h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                    isSelected
                      ? "border-primary bg-primary"
                      : "border-muted-foreground/40"
                  }`}
                >
                  {isSelected && (
                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* VIN — prominent */}
                  <p className="font-bold text-sm font-mono leading-tight tracking-wide truncate">
                    {vehicle.vin}
                  </p>

                  {/* Model + code */}
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className="text-xs text-foreground/80 font-medium truncate">
                      {vehicle.model.version}
                    </span>
                    <Badge
                      variant="outline"
                      className="font-mono text-[10px] px-1.5 py-0"
                    >
                      {vehicle.model.code}
                    </Badge>
                  </div>

                  {/* Specs + status */}
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

                  {/* Status */}
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
          })}
        </div>
      ) : (
        <div className="text-center py-10 text-sm text-muted-foreground">
          No hay vehículos disponibles
        </div>
      )}
    </GeneralModal>
  );
}
