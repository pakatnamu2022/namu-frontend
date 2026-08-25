"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useNavigate } from "react-router-dom";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormTextArea } from "@/shared/components/FormTextArea";
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
  Fingerprint,
  MapPin,
  AlertTriangle,
  MessageSquare,
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
import {
  vehicleDeliveryApproveExtraordinarySchema,
  vehicleDeliveryRejectExtraordinarySchema,
  type VehicleDeliveryApproveExtraordinarySchema,
  type VehicleDeliveryRejectExtraordinarySchema,
} from "@/features/ap/comercial/entrega-vehiculo/lib/vehicleDelivery.schema";
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

  const approveForm = useForm<VehicleDeliveryApproveExtraordinarySchema>({
    resolver: zodResolver(vehicleDeliveryApproveExtraordinarySchema),
    defaultValues: { comment: "" },
  });

  const rejectForm = useForm<VehicleDeliveryRejectExtraordinarySchema>({
    resolver: zodResolver(vehicleDeliveryRejectExtraordinarySchema),
    defaultValues: { comment: "" },
  });

  useEffect(() => {
    if (vehicleDelivery && !vehicleDelivery.is_extraordinary) {
      router(ABSOLUTE_ROUTE, { replace: true });
    }
  }, [vehicleDelivery, router, ABSOLUTE_ROUTE]);

  if (!canApprove) notFound();
  if (isLoading) return <PageSkeleton />;
  if (!vehicleDelivery) notFound();
  if (!vehicleDelivery.is_extraordinary) return <PageSkeleton />;

  const {
    extraordinary_approved,
    extraordinary_approved_at,
    extraordinary_approved_by,
    extraordinary_approval_comment,
  } = vehicleDelivery;

  const isPending =
    extraordinary_approved === null || extraordinary_approved === undefined;
  const isApproved = extraordinary_approved === true;
  const isRejected = extraordinary_approved === false;

  const isProcessing = approveMutation.isPending || rejectMutation.isPending;

  const closeDialog = () => {
    setConfirmAction(null);
    approveForm.reset({ comment: "" });
    rejectForm.reset({ comment: "" });
  };

  const handleApprove = (data: VehicleDeliveryApproveExtraordinarySchema) => {
    approveMutation.mutate(
      { id, comment: data.comment?.trim() || undefined },
      { onSuccess: closeDialog },
    );
  };

  const handleReject = (data: VehicleDeliveryRejectExtraordinarySchema) => {
    rejectMutation.mutate(
      { id, comment: data.comment.trim() },
      { onSuccess: closeDialog },
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router(ABSOLUTE_ROUTE)}
        >
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
              <div className="flex items-center gap-2">
                <Fingerprint className="size-3.5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">VIN</p>
                  <p className="font-semibold text-sm">
                    {vehicleDelivery.vin ?? "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Car className="size-3.5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Vehículo</p>
                  <p className="font-semibold text-sm">
                    {vehicleDelivery.vehicle?.model?.version ?? "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <User className="size-3.5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Asesor / Cliente
                  </p>
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
              <div className="flex items-center gap-2">
                <MapPin className="size-3.5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Sede</p>
                  <p className="font-semibold text-sm">
                    {vehicleDelivery.sede_name ?? "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="size-3.5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Fecha de entrega programada
                  </p>
                  <p className="font-semibold text-sm">
                    {format(
                      new Date(vehicleDelivery.scheduled_delivery_date),
                      "dd/MM/yyyy HH:mm",
                      { locale: es },
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-3.5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Motivo de la entrega extraordinaria
                  </p>
                  <p className="text-sm font-semibold">
                    {vehicleDelivery.extraordinary_reason ?? "—"}
                  </p>
                </div>
              </div>
              {vehicleDelivery.observations && (
                <div className="flex items-center gap-2">
                  <MessageSquare className="size-3.5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Observaciones
                    </p>
                    <p className="text-sm">{vehicleDelivery.observations}</p>
                  </div>
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
                    Rechazada
                  </Badge>
                )}
              </div>

              {!isPending && (
                <div className="text-sm text-muted-foreground space-y-1">
                  {extraordinary_approved_by && (
                    <p>
                      {isApproved ? "Aprobado" : "Rechazado"} por:{" "}
                      <span className="font-medium text-foreground">
                        {extraordinary_approved_by}
                      </span>
                    </p>
                  )}
                  {extraordinary_approved_at && (
                    <p>
                      Fecha:{" "}
                      <span className="font-medium text-foreground">
                        {format(
                          new Date(extraordinary_approved_at),
                          "dd/MM/yyyy HH:mm",
                          {
                            locale: es,
                          },
                        )}
                      </span>
                    </p>
                  )}
                  {extraordinary_approval_comment && (
                    <p>
                      {isApproved ? "Comentario" : "Motivo del rechazo"}:{" "}
                      <span className="font-medium text-foreground">
                        {extraordinary_approval_comment}
                      </span>
                    </p>
                  )}
                </div>
              )}

              {isPending && (
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button
                    onClick={() => setConfirmAction("approve")}
                    disabled={isProcessing}
                    color="green"
                  >
                    <CheckCircle2 className="mr-2 size-4" />
                    Aprobar Entrega
                  </Button>
                  <Button
                    onClick={() => setConfirmAction("reject")}
                    disabled={isProcessing}
                    color="red"
                  >
                    <XCircle className="mr-2 size-4" />
                    Rechazar Entrega
                  </Button>
                </div>
              )}
            </div>
          </GroupFormSection>
        </div>
      </div>

      <GeneralModal
        open={confirmAction === "approve"}
        onClose={closeDialog}
        title="Aprobar entrega extraordinaria"
        icon="CheckCircle2"
        size="md"
      >
        <Form {...approveForm}>
          <form
            onSubmit={approveForm.handleSubmit(handleApprove)}
            className="space-y-4"
          >
            <p className="text-sm text-muted-foreground">
              ¿Está seguro de que desea aprobar esta entrega extraordinaria? El
              asesor podrá continuar con el proceso de entrega.
            </p>

            <FormTextArea
              name="comment"
              label="Observaciones"
              optional
              placeholder="Agregue un comentario sobre la aprobación (opcional)"
              control={approveForm.control}
              maxLength={2000}
              disabled={isProcessing}
              rows={3}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={closeDialog}
                disabled={isProcessing}
              >
                Cancelar
              </Button>
              <Button type="submit" color="green" disabled={isProcessing}>
                {isProcessing ? "Procesando..." : "Sí, aprobar"}
              </Button>
            </div>
          </form>
        </Form>
      </GeneralModal>

      <GeneralModal
        open={confirmAction === "reject"}
        onClose={closeDialog}
        title="Rechazar entrega extraordinaria"
        icon="XCircle"
        size="md"
      >
        <Form {...rejectForm}>
          <form
            onSubmit={rejectForm.handleSubmit(handleReject)}
            className="space-y-4"
          >
            <p className="text-sm text-muted-foreground">
              ¿Está seguro de que desea rechazar esta entrega extraordinaria? El
              asesor no podrá continuar con el proceso de entrega.
            </p>

            <FormTextArea
              name="comment"
              label="Observaciones"
              required
              placeholder="Indique el motivo por el que se rechaza la entrega"
              control={rejectForm.control}
              maxLength={2000}
              disabled={isProcessing}
              rows={3}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={closeDialog}
                disabled={isProcessing}
              >
                Cancelar
              </Button>
              <Button type="submit" color="red" disabled={isProcessing}>
                {isProcessing ? "Procesando..." : "Sí, rechazar"}
              </Button>
            </div>
          </form>
        </Form>
      </GeneralModal>
    </div>
  );
}
