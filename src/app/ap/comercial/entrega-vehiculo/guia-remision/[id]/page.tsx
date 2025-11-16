"use client";

import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import {
  useVehicleDeliveryById,
  useGenerateOrUpdateShippingGuide,
} from "@/features/ap/comercial/entrega-vehiculo/lib/vehicleDelivery.hook";
import { ShippingGuideForm } from "@/features/ap/comercial/entrega-vehiculo/components/ShippingGuideForm";
import { ShippingGuideSchema } from "@/features/ap/comercial/entrega-vehiculo/lib/ShippingGuides.schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { errorToast, successToast } from "@/core/core.function";
import { Separator } from "@/components/ui/separator";
import { JSX } from "react";
import NotFound from "@/app/not-found";

export default function ShippingGuidePage(): JSX.Element {
  const params = useParams();
  const router = useNavigate();
  const id = Number(params.id);

  const {
    data: vehicleDelivery,
    isLoading,
    refetch,
  } = useVehicleDeliveryById(id);
  const generateMutation = useGenerateOrUpdateShippingGuide();

  if (isLoading) return <PageSkeleton />;
  if (!vehicleDelivery) return <NotFound />;

  const shippingGuide = vehicleDelivery.shipping_guide;
  const canEdit = !shippingGuide?.aceptada_por_sunat;

  const handleSubmit = async (data: ShippingGuideSchema) => {
    try {
      await generateMutation.mutateAsync({
        id,
        data,
      });
      successToast(
        shippingGuide
          ? "Guía de remisión actualizada exitosamente"
          : "Guía de remisión creada exitosamente"
      );
      await refetch();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Error al procesar la guía de remisión";
      errorToast(errorMessage);
    }
  };

  const handleCancel = () => {
    router(-1);
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

      <div className="grid gap-4">
        {/* Información del Vehículo */}
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
                  variant={
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
                  variant={
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

        {/* Estado de SUNAT si existe la guía */}
        {shippingGuide && (
          <>
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
                      variant={
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
                      variant={
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

                {/* Enlaces de documentos */}
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
                                "_blank"
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
                                "_blank"
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
                                "_blank"
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

            {!canEdit && (
              <Card className="border-yellow-500 bg-yellow-50">
                <CardContent className="pt-6">
                  <p className="text-sm text-yellow-800">
                    Esta guía de remisión ya ha sido aceptada por SUNAT y no
                    puede ser editada.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Formulario de Guía de Remisión */}
        <Card>
          <CardHeader>
            <CardTitle>
              {shippingGuide ? "Datos del Conductor" : "Crear Guía de Remisión"}
            </CardTitle>
            <CardDescription>
              {shippingGuide
                ? canEdit
                  ? "Puedes actualizar los datos mientras no esté aceptada por SUNAT"
                  : "Información del conductor registrada"
                : "Complete los datos del conductor para generar la guía de remisión"}
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                      carrier_ruc: shippingGuide.ruc_transport || "",
                      company_name_transport:
                        shippingGuide.company_name_transport || "",
                      notes: shippingGuide.notes || "",
                    }
                  : undefined
              }
              onSubmit={handleSubmit}
              isSubmitting={generateMutation.isPending}
              isDisabled={!canEdit}
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
