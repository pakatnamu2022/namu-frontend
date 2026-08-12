"use client";

import { Car } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { VehiclesDeliveryResource } from "../lib/vehicleDelivery.interface";
import RescheduleHistorySheet from "./RescheduleHistorySheet";

interface ShippingGuideVehicleInfoCardProps {
  vehicleDelivery: VehiclesDeliveryResource;
}

export function ShippingGuideVehicleInfoCard({
  vehicleDelivery,
}: ShippingGuideVehicleInfoCardProps) {
  return (
    <GroupFormSection
      title="Información del Vehículo"
      icon={Car}
      color="slate"
      cols={{ sm: 1, md: 1, lg: 1 }}
    >
      <div className="space-y-3">
        <div>
          <p className="text-xs text-muted-foreground">VIN</p>
          <p className="font-semibold text-sm">{vehicleDelivery.vin}</p>
        </div>
        {vehicleDelivery.client_name && (
          <div>
            <p className="text-xs text-muted-foreground">Cliente</p>
            <p className="font-semibold text-sm">
              {vehicleDelivery.client_name}
            </p>
          </div>
        )}
        <div>
          <p className="text-xs text-muted-foreground">Asesor</p>
          <p className="font-semibold text-sm">
            {vehicleDelivery.advisor_name}
          </p>
        </div>
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-xs text-muted-foreground">Sede</p>
            <p className="font-semibold text-sm">
              {vehicleDelivery.sede_name}
            </p>
          </div>
          {vehicleDelivery.rescheduled_by && (
            <RescheduleHistorySheet
              vehicleDeliveryId={vehicleDelivery.id}
              vin={vehicleDelivery.vin}
            />
          )}
        </div>
        <div className="flex gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Estado Lavado</p>
            <Badge
              color={
                vehicleDelivery.status_wash === "completed"
                  ? "default"
                  : "secondary"
              }
              className="mt-0.5"
            >
              {vehicleDelivery.status_wash === "completed"
                ? "Completado"
                : "Pendiente"}
            </Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Estado Entrega</p>
            <Badge
              color={
                vehicleDelivery.status_delivery === "completed"
                  ? "default"
                  : "secondary"
              }
              className="mt-0.5"
            >
              {vehicleDelivery.status_delivery === "completed"
                ? "Completado"
                : vehicleDelivery.status_delivery === "delivered"
                  ? "Entregado"
                  : "Pendiente"}
            </Badge>
          </div>
        </div>
        {vehicleDelivery.observations && (
          <div>
            <p className="text-xs text-muted-foreground">Observaciones</p>
            <p className="text-sm">{vehicleDelivery.observations}</p>
          </div>
        )}
      </div>
    </GroupFormSection>
  );
}
