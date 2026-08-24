"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SimpleConfirmDialog } from "@/shared/components/SimpleConfirmDialog";
import {
  ArrowLeft,
  Car,
  User,
  Calendar,
  ShieldCheck,
  ShieldX,
  Hourglass,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { JSX } from "react";
import { notFound } from "@/shared/hooks/useNotFound";
import { VEHICLE_DELIVERY } from "@/features/ap/comercial/entrega-vehiculo/lib/vehicleDelivery.constants";
import {
  useVehicleDeliveryById,
  useApproveExtraordinaryVehicleDelivery,
  useRejectExtraordinaryVehicleDelivery,
} from "@/features/ap/comercial/entrega-vehiculo/lib/vehicleDelivery.hook";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";

export default function VehicleDeliveryApprovalPage(): JSX.Element {
  const params = useParams();
  const router = useNavigate();
  const id = Number(params.id);
  const { ROUTE, ABSOLUTE_ROUTE } = VEHICLE_DELIVERY;

  const { canApprove } = useModulePermissions(ROUTE);
  const { data: vehicleDelivery, isLoading } = useVehicleDeliveryById(id);
  const approveMutation = useApproveExtraordinaryVehicleDelivery();
  const rejectMutation = useRejectExtraordinaryVehicleDelivery();

  const [confirmAction, setConfirmAction] = useState<
    "approve" | "reject" | null
  >(null);

  useEffect(() => {
    if (vehicleDelivery && !vehicleDelivery.is_extraordinary) {
      router(ABSOLUTE_ROUTE, { replace: true });
    }
  }, [vehicleDelivery, router, ABSOLUTE_ROUTE]);

  if (!canApprove) notFound();
  if (isLoading) return <PageSkeleton />;
  if (!vehicleDelivery) notFound();
  if (!vehicleDelivery.is_extraordinary) return <PageSkeleton />;

  const { extraordinary_approved, extraordinary_approved_at, extraordinary_approved_by } =
    vehicleDelivery;

  const isPending =
    extraordinary_approved === null || extraordinary_approved === undefined;
  const isApproved = extraordinary_approved === true;
  const isRejected = extraordinary_approved === false;

  const isProcessing = approveMutation.isPending || rejectMutation.isPending;

  const handleConfirm = () => {
    if (confirmAction === "approve") {
      approveMutation.mutate(id, { onSuccess: () => setConfirmAction(null) });
    } else if (confirmAction === "reject") {
      rejectMutation.mutate(id, { onSuccess: () => setConfirmAction(null) });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router(ABSOLUTE_ROUTE)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <TitleComponent
          title="Aprobación de Entrega Extraordinaria"
          subtitle={`VIN: ${vehicleDelivery.vin ?? "—"}`}
          icon="ShieldCheck"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* Columna izquierda: información de la entrega */}
        <div className="lg:col-span-1 space-y-4">
          <GroupFormSection
            title="Información de la Entrega"
            icon={Car}
            color="slate"
            cols={{ sm: 1, md: 1, lg: 1 }}
          >
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">VIN</p>
                <p className="font-semibold text-sm">{vehicleDelivery.vin ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Vehículo</p>
                <p className="font-semibold text-sm">
                  {vehicleDelivery.vehicle?.model?.version ?? "—"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <User className="size-3.5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Asesor / Cliente</p>
                  <p className="font-semibold text-sm">
                    {vehicleDelivery.advisor_name ?? "—"}
                  </p>
                  {vehicleDelivery.client_name && (
                    <p className="text-xs text-muted-foreground">
                      {vehicleDelivery.client_name}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sede</p>
                <p className="font-semibold text-sm">
                  {vehicleDelivery.sede_name ?? "—"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="size-3.5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Fecha de entrega programada</p>
                  <p className="font-semibold text-sm">
                    {format(
                      new Date(vehicleDelivery.scheduled_delivery_date),
                      "dd/MM/yyyy HH:mm",
                      { locale: es },
                    )}
                  </p>
                </div>
              </div>
              {vehicleDelivery.extraordinary_reason && (
                <div>
                  <p className="text-xs text-muted-foreground">
                    Motivo de la entrega extraordinaria
                  </p>
                  <p className="text-sm">{vehicleDelivery.extraordinary_reason}</p>
                </div>
              )}
              {vehicleDelivery.observations && (
                <div>
                  <p className="text-xs text-muted-foreground">Observaciones</p>
                  <p className="text-sm">{vehicleDelivery.observations}</p>
                </div>
              )}
            </div>
          </GroupFormSection>
        </div>

        {/* Columna derecha: estado y acciones de aprobación */}
        <div className="lg:col-span-2">
          <GroupFormSection
            title="Estado de Aprobación"
            icon={ShieldCheck}
            color={isApproved ? "green" : isRejected ? "red" : "amber"}
            cols={{ sm: 1, md: 1, lg: 1 }}
          >
            <div className="space-y-4 w-full">
              <div className="flex flex-wrap items-center gap-2">
                {isPending && (
                  <Badge color="amber" icon={Hourglass} className="w-fit">
                    Pendiente de aprobación
                  </Badge>
                )}
                {isApproved && (
                  <Badge color="green" icon={ShieldCheck} className="w-fit">
                    Aprobada
                  </Badge>
                )}
                {isRejected && (
                  <Badge color="red" icon={ShieldX} className="w-fit">
                    Anulada
                  </Badge>
                )}
              </div>

              {!isPending && (
                <div className="text-sm text-muted-foreground space-y-1">
                  {extraordinary_approved_by && (
                    <p>
                      {isApproved ? "Aprobado" : "Anulado"} por:{" "}
                      <span className="font-medium text-foreground">
                        {extraordinary_approved_by}
                      </span>
                    </p>
                  )}
                  {extraordinary_approved_at && (
                    <p>
                      Fecha:{" "}
                      <span className="font-medium text-foreground">
                        {format(new Date(extraordinary_approved_at), "dd/MM/yyyy HH:mm", {
                          locale: es,
                        })}
                      </span>
                    </p>
                  )}
                </div>
              )}

              {isPending && (
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => setConfirmAction("approve")}
                    disabled={isProcessing}
                  >
                    <CheckCircle2 className="mr-2 size-4" />
                    Aprobar Entrega
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setConfirmAction("reject")}
                    disabled={isProcessing}
                  >
                    <XCircle className="mr-2 size-4" />
                    Anular Entrega
                  </Button>
                </div>
              )}
            </div>
          </GroupFormSection>
        </div>
      </div>

      <SimpleConfirmDialog
        open={confirmAction !== null}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        onConfirm={handleConfirm}
        title={
          confirmAction === "approve"
            ? "Aprobar entrega extraordinaria"
            : "Anular entrega extraordinaria"
        }
        description={
          confirmAction === "approve"
            ? "¿Está seguro de que desea aprobar esta entrega extraordinaria? El asesor podrá continuar con el proceso de entrega."
            : "¿Está seguro de que desea anular esta entrega extraordinaria? El asesor no podrá continuar con el proceso de entrega."
        }
        confirmText={confirmAction === "approve" ? "Sí, aprobar" : "Sí, anular"}
        cancelText="Cancelar"
        variant={confirmAction === "approve" ? "default" : "destructive"}
        icon={confirmAction === "approve" ? "success" : "danger"}
        isLoading={isProcessing}
      />
    </div>
  );
}
