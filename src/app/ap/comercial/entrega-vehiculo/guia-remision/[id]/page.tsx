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
import { DeliveryChecklistSection } from "@/features/ap/comercial/entrega-vehiculo/components/DeliveryChecklistSection";
import { useDeliveryChecklist } from "@/features/ap/comercial/entrega-vehiculo/lib/deliveryChecklist.hook";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  FileText,
  Info,
} from "lucide-react";
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
            <div>
              <p className="text-sm text-muted-foreground">Observaciones</p>
              <p className="text-sm">
                {vehicleDelivery.observations || "Sin observaciones"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs: Checklist + Shipping guide */}
      <Tabs defaultValue="checklist" className="w-full">
        <div className="overflow-x-auto overflow-y-hidden scrollbar-hide mx-0">
          <TabsList className="inline-flex w-auto min-w-full lg:w-full lg:grid lg:grid-cols-2 gap-1">
            <TabsTrigger
              value="checklist"
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <ClipboardList className="h-4 w-4 shrink-0" />
              <span>Checklist de Entrega</span>
              {checklistConfirmed && (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
              )}
            </TabsTrigger>
            <TabsTrigger
              value="guia"
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <FileText className="h-4 w-4 shrink-0" />
              <span>Guía de Remisión</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="mt-4">
          {/* Checklist tab */}
          <TabsContent value="checklist">
            <Card>
              <CardContent className="pt-6">
                <DeliveryChecklistSection vehicleDeliveryId={id} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shipping guide tab */}
          <TabsContent value="guia">
            <div className="space-y-4">
              {/* Checklist requirement warning */}
              {!checklistConfirmed && (
                <Card className="border-amber-400 bg-amber-50 dark:bg-amber-950/20">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start gap-3">
                      <Info className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                      <p className="text-sm text-amber-800 dark:text-amber-300">
                        Debe crear y confirmar el checklist de entrega antes de
                        generar la guía de remisión. Ve a la pestaña{" "}
                        <strong>Checklist de Entrega</strong> para completar
                        este paso.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* SUNAT status if guide exists */}
              {shippingGuide && (
                <Card>
                  <CardHeader>
                    <CardTitle>Estado de SUNAT</CardTitle>
                    <CardDescription>
                      Información sobre el envío a SUNAT
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Estado SUNAT
                        </p>
                        <Badge
                          color={
                            shippingGuide.aceptada_por_sunat
                              ? "default"
                              : "secondary"
                          }
                        >
                          {shippingGuide.aceptada_por_sunat
                            ? "Aceptada"
                            : "Pendiente"}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Registrado en SUNAT
                        </p>
                        <Badge
                          color={
                            shippingGuide.is_sunat_registered
                              ? "default"
                              : "secondary"
                          }
                        >
                          {shippingGuide.is_sunat_registered ? "Sí" : "No"}
                        </Badge>
                      </div>
                      {shippingGuide.sent_at && (
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Fecha de Envío
                          </p>
                          <p className="text-sm">
                            {new Date(shippingGuide.sent_at).toLocaleString()}
                          </p>
                        </div>
                      )}
                      {shippingGuide.notes && (
                        <div className="md:col-span-2">
                          <p className="text-sm text-muted-foreground">Notas</p>
                          <p className="text-sm">{shippingGuide.notes}</p>
                        </div>
                      )}
                    </div>

                    {(shippingGuide.enlace_del_pdf ||
                      shippingGuide.enlace_del_xml ||
                      shippingGuide.enlace_del_cdr) && (
                      <>
                        <Separator className="my-4" />
                        <div>
                          <p className="text-sm font-semibold mb-2">
                            Documentos Electrónicos
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {shippingGuide.enlace_del_pdf && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  window.open(
                                    shippingGuide.enlace_del_pdf!,
                                    "_blank",
                                  )
                                }
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Ver PDF
                              </Button>
                            )}
                            {shippingGuide.enlace_del_xml && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  window.open(
                                    shippingGuide.enlace_del_xml!,
                                    "_blank",
                                  )
                                }
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Ver XML
                              </Button>
                            )}
                            {shippingGuide.enlace_del_cdr && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  window.open(
                                    shippingGuide.enlace_del_cdr!,
                                    "_blank",
                                  )
                                }
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Ver CDR
                              </Button>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}

              {!canEdit && shippingGuide && (
                <Card className="border-yellow-500 bg-yellow-50">
                  <CardContent className="pt-6">
                    <p className="text-sm text-yellow-800">
                      Esta guía de remisión ya ha sido{" "}
                      {shippingGuide?.aceptada_por_sunat
                        ? "aceptada por SUNAT"
                        : "enviada a Dynamic"}{" "}
                      y no puede ser editada.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Shipping guide form */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {shippingGuide
                      ? "Datos del Conductor"
                      : "Crear Guía de Remisión"}
                  </CardTitle>
                  <CardDescription>
                    {shippingGuide
                      ? canEdit
                        ? "Puedes actualizar los datos mientras no esté aceptada por SUNAT o enviada a Dynamic"
                        : "Información del conductor registrada"
                      : checklistConfirmed
                        ? "Complete los datos del conductor para generar la guía de remisión"
                        : "Confirma el checklist de entrega para habilitar este formulario"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ShippingGuideForm
                    defaultValues={
                      shippingGuide
                        ? {
                            transfer_modality_id:
                              shippingGuide.transfer_modality_id?.toString() ||
                              "",
                            driver_doc: shippingGuide.driver_doc || "",
                            license: shippingGuide.license || "",
                            plate: shippingGuide.plate || "",
                            driver_name: shippingGuide.driver_name || "",
                            transport_company_id:
                              shippingGuide.transport_company_id?.toString() ||
                              "",
                            notes: shippingGuide.notes || "",
                          }
                        : undefined
                    }
                    onSubmit={handleSubmit}
                    isSubmitting={generateMutation.isPending}
                    isDisabled={!canEdit || !checklistConfirmed}
                    onCancel={handleCancel}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
