"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Asignar Vehículo a Cotización</DialogTitle>
          <DialogDescription>
            Selecciona un vehículo disponible para asignar a esta cotización
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : vehicles && vehicles.length > 0 ? (
            <div className="space-y-2">
              {vehicles.map((vehicle: VehicleResource) => (
                <div
                  key={vehicle.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedVehicleId === vehicle.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedVehicleId(vehicle.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">
                          {vehicle.model.version}
                        </h4>
                        <span className="text-xs text-muted-foreground">
                          ({vehicle.model.code})
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">VIN:</span>{" "}
                          {vehicle.vin}
                        </div>
                        <div>
                          <span className="font-medium">Año:</span>{" "}
                          {vehicle.year}
                        </div>
                        <div>
                          <span className="font-medium">Color:</span>{" "}
                          {vehicle.vehicle_color}
                        </div>
                        <div>
                          <span className="font-medium">Motor:</span>{" "}
                          {vehicle.engine_type}
                        </div>
                        {vehicle.warehouse_name && (
                          <div className="col-span-2">
                            <span className="font-medium">Almacén:</span>{" "}
                            {vehicle.warehouse_name}
                          </div>
                        )}
                      </div>
                      <div className="mt-2">
                        <span
                          className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium"
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
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No hay vehículos disponibles
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setSelectedVehicleId(null);
              }}
            >
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
                "Asignar Vehículo"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
