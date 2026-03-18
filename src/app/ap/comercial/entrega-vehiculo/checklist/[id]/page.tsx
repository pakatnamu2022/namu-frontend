"use client";

import { useParams, useNavigate } from "react-router-dom";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import { useVehicleDeliveryById } from "@/features/ap/comercial/entrega-vehiculo/lib/vehicleDelivery.hook";
import { useDeliveryChecklist } from "@/features/ap/comercial/entrega-vehiculo/lib/deliveryChecklist.hook";
import { DeliveryChecklistSection } from "@/features/ap/comercial/entrega-vehiculo/components/DeliveryChecklistSection";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { JSX } from "react";
import { notFound } from "@/shared/hooks/useNotFound";
import { VEHICLE_DELIVERY } from "@/features/ap/comercial/entrega-vehiculo/lib/vehicleDelivery.constants";

export default function DeliveryChecklistPage(): JSX.Element {
  const params = useParams();
  const router = useNavigate();
  const id = Number(params.id);
  const { ABSOLUTE_ROUTE } = VEHICLE_DELIVERY;

  const { data: vehicleDelivery, isLoading } = useVehicleDeliveryById(id);
  const { data: checklist } = useDeliveryChecklist(id);

  if (isLoading) return <PageSkeleton />;
  if (!vehicleDelivery) notFound();

  const checklistConfirmed = checklist?.status === "confirmed";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router(ABSOLUTE_ROUTE)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <TitleComponent
          title="Checklist de Entrega"
          subtitle={`VIN: ${vehicleDelivery.vin}`}
          icon="ClipboardList"
        />
      </div>

      {/* Vehicle info */}
      <Card>
        <CardHeader>
          <CardTitle>Información de la Entrega</CardTitle>
          <CardDescription>Detalles del vehículo a entregar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">VIN</p>
              <p className="font-semibold">{vehicleDelivery.vin}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Asesor</p>
              <p className="font-semibold">{vehicleDelivery.advisor_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sede</p>
              <p className="font-semibold">{vehicleDelivery.sede_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estado Lavado</p>
              <Badge
                color={
                  vehicleDelivery.status_wash === "Completado"
                    ? "default"
                    : "secondary"
                }
              >
                {vehicleDelivery.status_wash}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estado Entrega</p>
              <Badge
                color={
                  vehicleDelivery.status_delivery === "Completado"
                    ? "default"
                    : "secondary"
                }
              >
                {vehicleDelivery.status_delivery}
              </Badge>
            </div>
            {vehicleDelivery.observations && (
              <div>
                <p className="text-sm text-muted-foreground">Observaciones</p>
                <p className="text-sm">{vehicleDelivery.observations}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Checklist */}
      <Card>
        <CardContent className="pt-6">
          <DeliveryChecklistSection vehicleDeliveryId={id} />
        </CardContent>
      </Card>

      {/* Navigate to shipping guide when confirmed */}
      {checklistConfirmed && (
        <div className="flex justify-end">
          <Button onClick={() => router(`${ABSOLUTE_ROUTE}/guia-remision/${id}`)}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Ir a Guía de Remisión
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
