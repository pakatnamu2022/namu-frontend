"use client";

import { useParams, useNavigate } from "react-router-dom";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import {
  useVehicleDeliveryById,
  useGenerateOrUpdateShippingGuide,
} from "@/features/ap/comercial/entrega-vehiculo/lib/vehicleDelivery.hook";
import { ShippingGuideForm } from "@/features/ap/comercial/entrega-vehiculo/components/ShippingGuideForm";
import { ShippingGuideSchema } from "@/features/ap/comercial/entrega-vehiculo/lib/ShippingGuides.schema";
import { useDeliveryChecklist } from "@/features/ap/comercial/entrega-vehiculo/lib/deliveryChecklist.hook";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Car,
  CheckCircle2,
  Circle,
  ClipboardList,
  ExternalLink,
  FileText,
  Info,
  Shield,
  XCircle,
} from "lucide-react";
import { errorToast, successToast } from "@/core/core.function";
import { JSX } from "react";
import { notFound } from "@/shared/hooks/useNotFound";
import { VEHICLE_DELIVERY } from "@/features/ap/comercial/entrega-vehiculo/lib/vehicleDelivery.constants";

const SOURCE_BADGE: Record<
  string,
  { label: string; color: "blue" | "orange" | "gray" }
> = {
  reception: { label: "Recepción", color: "blue" },
  purchase_order: { label: "Accesorio OC", color: "orange" },
  manual: { label: "Manual", color: "gray" },
};

export default function ShippingGuidePage(): JSX.Element {
  const params = useParams();
  const router = useNavigate();
  const id = Number(params.id);
  const { ABSOLUTE_ROUTE } = VEHICLE_DELIVERY;

  const { data: vehicleDelivery, isLoading } = useVehicleDeliveryById(id);
  const { data: checklist } = useDeliveryChecklist(id);
  const generateMutation = useGenerateOrUpdateShippingGuide();

  if (isLoading) return <PageSkeleton />;
  if (!vehicleDelivery) notFound();

  const shippingGuide = vehicleDelivery.shipping_guide;
  const isSent = Boolean(
    vehicleDelivery?.sent_at &&
      (vehicleDelivery?.aceptada_por_sunat || vehicleDelivery?.status_dynamic),
  );
  const rejectedBySunat = vehicleDelivery?.aceptada_por_sunat === false;
  const canEdit =
    !shippingGuide?.aceptada_por_sunat && (!isSent || rejectedBySunat);

  const checklistConfirmed = checklist?.status === "confirmed";
  const isDraft = checklist?.status === "draft";
  const hasChecklist = checklist?.id != null;
  const items = checklist?.items ?? [];
  const totalCount = items.length;
  const confirmedCount = items.filter((i) => i.is_confirmed).length;

  const handleSubmit = async (data: ShippingGuideSchema) => {
    try {
      await generateMutation.mutateAsync({ id, data });
      successToast(
        shippingGuide
          ? "Guía de remisión actualizada exitosamente"
          : "Guía de remisión creada exitosamente",
      );
      router(ABSOLUTE_ROUTE);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Error al procesar la guía de remisión";
      errorToast(errorMessage);
    }
  };

  const handleCancel = () => {
    router(ABSOLUTE_ROUTE);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <TitleComponent
          title="Guía de Remisión"
          subtitle={`Entrega de Vehículo - VIN: ${vehicleDelivery.vin}`}
          icon="FileText"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* Columna izquierda (1/3) — info vehículo + checklist */}
        <div className="lg:col-span-1 space-y-4">
          {/* Información del Vehículo */}
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
                  <p className="font-semibold text-sm">{vehicleDelivery.client_name}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground">Asesor</p>
                <p className="font-semibold text-sm">{vehicleDelivery.advisor_name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sede</p>
                <p className="font-semibold text-sm">{vehicleDelivery.sede_name}</p>
              </div>
              <div className="flex gap-4">
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
                    color={vehicleDelivery.status_delivery === "Completado" ? "default" : "secondary"}
                    className="mt-0.5"
                  >
                    {vehicleDelivery.status_delivery}
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

          {/* Checklist de Entrega */}
          <GroupFormSection
            title="Checklist de Entrega"
            icon={ClipboardList}
            color="primary"
            cols={{ sm: 1, md: 1, lg: 1 }}
          >
            <div className="space-y-3">
              {/* Estado */}
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

              {/* Barra de progreso */}
              {hasChecklist && totalCount > 0 && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progreso</span>
                    <span className="font-medium">{confirmedCount}/{totalCount} conformes</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: totalCount ? `${(confirmedCount / totalCount) * 100}%` : "0%" }}
                    />
                  </div>
                </div>
              )}

              {/* Items del checklist */}
              {items.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  {items.map((item, index) => {
                    const sourceBadge = SOURCE_BADGE[item.source] ?? SOURCE_BADGE.manual;
                    return (
                      <div
                        key={item.id ?? `item-${index}`}
                        className={cn(
                          "flex items-start gap-2 px-2.5 py-2 rounded-md border text-xs",
                          item.is_confirmed
                            ? "bg-green-50/60 border-green-200 dark:bg-green-950/20 dark:border-green-800"
                            : "bg-background border-border"
                        )}
                      >
                        <span className="text-muted-foreground w-4 shrink-0 text-center pt-0.5">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <p className={cn(
                            "font-medium leading-tight",
                            item.is_confirmed && "text-green-800 dark:text-green-300"
                          )}>
                            {item.description}
                          </p>
                          <p className="text-muted-foreground">
                            {item.quantity}{item.unit ? ` ${item.unit}` : ""}
                            {item.observations ? ` · ${item.observations}` : ""}
                          </p>
                        </div>
                        <Badge color={sourceBadge.color} className="text-xs shrink-0 whitespace-nowrap">
                          {sourceBadge.label}
                        </Badge>
                        <span className={cn(
                          "flex items-center gap-1 shrink-0 font-medium",
                          item.is_confirmed ? "text-green-600" : "text-muted-foreground"
                        )}>
                          {item.is_confirmed
                            ? <CheckCircle2 className="size-3.5" />
                            : <Circle className="size-3.5" />}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Confirmado por */}
              {checklistConfirmed && checklist?.confirmed_by_name && (
                <div className="rounded-md border bg-muted/40 px-3 py-2 space-y-0.5">
                  <p className="text-xs text-muted-foreground">Confirmado por</p>
                  <p className="text-sm font-medium">{checklist.confirmed_by_name}</p>
                  {checklist.confirmed_at && (
                    <p className="text-xs text-muted-foreground">
                      {new Date(checklist.confirmed_at).toLocaleString("es-PE", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>
              )}
            </div>
          </GroupFormSection>
        </div>

        {/* Columna derecha (2/3) — formulario guía */}
        <div className="lg:col-span-2 space-y-4">
          {/* Alerta checklist no confirmado */}
          {!checklistConfirmed && (
            <div className="flex items-start gap-3 rounded-lg border border-amber-400 bg-amber-50 dark:bg-amber-950/20 px-4 py-3">
              <Info className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-800 dark:text-amber-300">
                El checklist de entrega aún no ha sido confirmado. Debe ser
                completado y confirmado antes de generar la guía de remisión.
              </p>
            </div>
          )}

          {/* Alerta guía no editable */}
          {!canEdit && shippingGuide && (
            <div className="flex items-start gap-3 rounded-lg border border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20 px-4 py-3">
              <Info className="h-4 w-4 text-yellow-700 mt-0.5 shrink-0" />
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                Esta guía de remisión ya ha sido{" "}
                {shippingGuide?.aceptada_por_sunat
                  ? "aceptada por SUNAT"
                  : "enviada a Dynamic"}{" "}
                y no puede ser editada.
              </p>
            </div>
          )}

          {/* Estado SUNAT */}
          {shippingGuide && (
            <GroupFormSection
              title="Estado SUNAT"
              icon={Shield}
              color="slate"
              cols={{ sm: 1, md: 2, lg: 2 }}
            >
              <div>
                <p className="text-xs text-muted-foreground">Estado SUNAT</p>
                <Badge
                  color={shippingGuide.aceptada_por_sunat ? "default" : "secondary"}
                  className="mt-0.5"
                >
                  {shippingGuide.aceptada_por_sunat ? "Aceptada" : "Pendiente"}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Registrado en SUNAT</p>
                <Badge
                  color={shippingGuide.is_sunat_registered ? "default" : "secondary"}
                  className="mt-0.5"
                >
                  {shippingGuide.is_sunat_registered ? "Sí" : "No"}
                </Badge>
              </div>
              {shippingGuide.sent_at && (
                <div>
                  <p className="text-xs text-muted-foreground">Fecha de Envío</p>
                  <p className="text-sm font-medium">
                    {new Date(shippingGuide.sent_at).toLocaleString("es-PE", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              )}
              {shippingGuide.notes && (
                <div className="md:col-span-2">
                  <p className="text-xs text-muted-foreground">Notas</p>
                  <p className="text-sm">{shippingGuide.notes}</p>
                </div>
              )}

              {/* Documentos electrónicos */}
              {(shippingGuide.enlace_del_pdf ||
                shippingGuide.enlace_del_xml ||
                shippingGuide.enlace_del_cdr) && (
                <div className="md:col-span-2 pt-1">
                  <p className="text-xs text-muted-foreground mb-2">Documentos Electrónicos</p>
                  <div className="flex flex-wrap gap-2">
                    {shippingGuide.enlace_del_pdf && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(shippingGuide.enlace_del_pdf!, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ver PDF
                      </Button>
                    )}
                    {shippingGuide.enlace_del_xml && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(shippingGuide.enlace_del_xml!, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ver XML
                      </Button>
                    )}
                    {shippingGuide.enlace_del_cdr && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(shippingGuide.enlace_del_cdr!, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ver CDR
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </GroupFormSection>
          )}

          {/* Formulario de guía */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 px-0.5">
              <FileText className="h-4 w-4 text-primary shrink-0" />
              <span className="font-semibold text-sm">
                {shippingGuide ? "Datos del Conductor" : "Crear Guía de Remisión"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground px-0.5">
              {shippingGuide
                ? canEdit
                  ? "Puedes actualizar los datos mientras no esté aceptada por SUNAT o enviada a Dynamic"
                  : "Información del conductor registrada"
                : checklistConfirmed
                  ? "Complete los datos del conductor para generar la guía de remisión"
                  : "Confirma el checklist de entrega para habilitar este formulario"}
            </p>
          </div>
          <ShippingGuideForm
            defaultValues={
              shippingGuide
                ? {
                    transfer_modality_id:
                      shippingGuide.transfer_modality_id?.toString() || "",
                    driver_doc: shippingGuide.driver_doc || "",
                    license: shippingGuide.license || "",
                    plate: shippingGuide.plate || "",
                    driver_name: shippingGuide.driver_name || "",
                    transport_company_id:
                      shippingGuide.transport_company_id?.toString() || "",
                    notes: shippingGuide.notes || "",
                  }
                : undefined
            }
            onSubmit={handleSubmit}
            isSubmitting={generateMutation.isPending}
            isDisabled={!canEdit || !checklistConfirmed}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}
