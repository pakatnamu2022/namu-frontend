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
import { ShippingGuideVehicleInfoCard } from "@/features/ap/comercial/entrega-vehiculo/components/ShippingGuideVehicleInfoCard";
import { ShippingGuideChecklistCard } from "@/features/ap/comercial/entrega-vehiculo/components/ShippingGuideChecklistCard";
import { ShippingGuideSunatStatusCard } from "@/features/ap/comercial/entrega-vehiculo/components/ShippingGuideSunatStatusCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Info } from "lucide-react";
import { errorToast, successToast } from "@/core/core.function";
import { JSX } from "react";
import { notFound } from "@/shared/hooks/useNotFound";
import { VEHICLE_DELIVERY } from "@/features/ap/comercial/entrega-vehiculo/lib/vehicleDelivery.constants";

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
          <ShippingGuideVehicleInfoCard vehicleDelivery={vehicleDelivery} />
          <ShippingGuideChecklistCard checklist={checklist} />
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
            <ShippingGuideSunatStatusCard shippingGuide={shippingGuide} />
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
            vehicleDelivery={vehicleDelivery}
          />
        </div>
      </div>
    </div>
  );
}
