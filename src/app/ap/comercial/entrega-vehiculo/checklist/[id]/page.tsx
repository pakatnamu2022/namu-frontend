"use client";

import { useParams, useNavigate } from "react-router-dom";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import { useVehicleDeliveryById } from "@/features/ap/comercial/entrega-vehiculo/lib/vehicleDelivery.hook";
import { useDeliveryChecklist } from "@/features/ap/comercial/entrega-vehiculo/lib/deliveryChecklist.hook";
import { DeliveryChecklistSection } from "@/features/ap/comercial/entrega-vehiculo/components/DeliveryChecklistSection";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Car, CheckCircle2, ClipboardList } from "lucide-react";
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
  const isDraft = checklist?.status === "draft";
  const hasChecklist = checklist?.id != null;
  const totalCount = checklist?.items?.length ?? 0;
  const confirmedCount = checklist?.items?.filter((i) => i.is_confirmed).length ?? 0;

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* Columna izquierda (1/3) */}
        <div className="lg:col-span-1 space-y-4">
          {/* Estado del checklist — primera card */}
          <GroupFormSection
            title="Checklist de Entrega"
            icon={ClipboardList}
            color="primary"
            cols={{ sm: 1, md: 1, lg: 1 }}
          >
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {!hasChecklist && (
                  <Badge color="gray" className="text-xs">Sin checklist</Badge>
                )}
                {isDraft && (
                  <Badge color="blue" className="text-xs">Borrador</Badge>
                )}
                {checklistConfirmed && (
                  <Badge color="green" icon={CheckCircle2} className="text-xs">Confirmado</Badge>
                )}
              </div>

              {hasChecklist && totalCount > 0 && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progreso</span>
                    <span className="font-medium">
                      {confirmedCount}/{totalCount} conformes
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{
                        width: totalCount
                          ? `${(confirmedCount / totalCount) * 100}%`
                          : "0%",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </GroupFormSection>

          {/* Información del vehículo */}
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
              <div>
                <p className="text-xs text-muted-foreground">Asesor</p>
                <p className="font-semibold text-sm">{vehicleDelivery.advisor_name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sede</p>
                <p className="font-semibold text-sm">{vehicleDelivery.sede_name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Estado Lavado</p>
                <Badge
                  color={vehicleDelivery.status_wash === "Completado" ? "default" : "secondary"}
                  className="mt-0.5"
                >
                  {vehicleDelivery.status_wash}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Estado Entrega</p>
                <Badge
                  color={
                    vehicleDelivery.status_delivery === "Completado" ? "default" : "secondary"
                  }
                  className="mt-0.5"
                >
                  {vehicleDelivery.status_delivery}
                </Badge>
              </div>
              {vehicleDelivery.observations && (
                <div>
                  <p className="text-xs text-muted-foreground">Observaciones</p>
                  <p className="text-sm">{vehicleDelivery.observations}</p>
                </div>
              )}
            </div>
          </GroupFormSection>
        </div>

        {/* Columna derecha (2/3) */}
        <div className="lg:col-span-2">
          <DeliveryChecklistSection
            vehicleDeliveryId={id}
            hideHeader
            onChecklistConfirmed={() =>
              router(`${ABSOLUTE_ROUTE}/guia-remision/${id}`)
            }
          />
        </div>
      </div>
    </div>
  );
}
