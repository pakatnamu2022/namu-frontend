import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VehiclesDeliveryResource } from "../lib/vehicleDelivery.interface";
import { useVehicleDeliveryById } from "../lib/vehicleDelivery.hook";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  FileText,
  Download,
  QrCode,
  FileCode,
  User,
  Calendar,
  Building2,
  CheckCircle2,
  XCircle,
  Car,
  ClipboardList,
  FileCheck,
  Truck,
  MapPin,
  Package,
} from "lucide-react";
import { SUNAT_CONCEPTS_ID } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.constants";

interface VehicleDeliveryDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicleDelivery: VehiclesDeliveryResource | null;
}

export function VehicleDeliveryDetailsSheet({
  open,
  onOpenChange,
  vehicleDelivery: initialVehicle,
}: VehicleDeliveryDetailsSheetProps) {
  const vehicleId = initialVehicle?.id || 0;

  // Consultar datos completos desde la API solo si está abierto y tiene un ID válido
  const { data: vehicleDelivery } = useVehicleDeliveryById(
    vehicleId,
    open && vehicleId > 0
  );

  if (!initialVehicle || !vehicleDelivery) return null;

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return "-";
    try {
      const parsedDate = typeof date === "string" ? new Date(date) : date;
      return format(parsedDate, "dd/MM/yyyy HH:mm", { locale: es });
    } catch {
      return "-";
    }
  };

  const formatDateOnly = (date: string | Date | null | undefined) => {
    if (!date) return "-";
    try {
      const parsedDate = typeof date === "string" ? new Date(date) : date;
      return format(parsedDate, "dd/MM/yyyy", { locale: es });
    } catch {
      return "-";
    }
  };

  // Determinar si es transporte público o privado
  const isPublicTransport =
    vehicleDelivery.shipping_guide?.transfer_modality_id ===
    SUNAT_CONCEPTS_ID.TYPE_TRANSPORTATION_PUBLIC;
  const isPrivateTransport =
    vehicleDelivery.shipping_guide?.transfer_modality_id ===
    SUNAT_CONCEPTS_ID.TYPE_TRANSPORTATION_PRIVATE;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-3xl lg:max-w-4xl overflow-y-auto"
      >
        <SheetHeader className="pb-6 border-b">
          <SheetTitle className="text-2xl font-bold text-primary">
            Detalles de Entrega de Vehículo
          </SheetTitle>
          <p className="text-sm text-muted-foreground mt-1">
            VIN: {vehicleDelivery.vin || "N/A"}
          </p>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Información del Vehículo */}
          <div className="space-y-4 p-5 bg-blue-50/50 rounded-lg border border-blue-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Car className="size-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      VIN
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      {vehicleDelivery.vin || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Building2 className="size-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      Sede
                    </p>
                    <p className="text-base text-gray-900">
                      {vehicleDelivery.sede_name || "-"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="size-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      Asesor
                    </p>
                    <p className="text-base text-gray-900">
                      {vehicleDelivery.advisor_name || "-"}
                    </p>
                  </div>
                </div>

                {vehicleDelivery.client_name && (
                  <div className="flex items-start gap-3">
                    <User className="size-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-500 mb-1">
                        Cliente
                      </p>
                      <p className="text-base text-gray-900">
                        {vehicleDelivery.client_name}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Fechas dentro de la card del vehículo */}
            <div className="border-t border-blue-200 pt-4 mt-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="size-5 text-primary" />
                <h4 className="text-sm font-semibold text-primary">Fechas</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    Fecha Lavado
                  </p>
                  <p className="text-sm text-gray-900">
                    {formatDateOnly(vehicleDelivery.wash_date)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    Fecha Entrega Programada
                  </p>
                  <p className="text-sm text-gray-900">
                    {formatDateOnly(vehicleDelivery.scheduled_delivery_date)}
                  </p>
                </div>
              </div>
            </div>

            {/* Observaciones dentro de la card del vehículo */}
            {vehicleDelivery.observations && (
              <div className="border-t border-blue-200 pt-4 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <ClipboardList className="size-5 text-primary" />
                  <h4 className="text-sm font-semibold text-primary">
                    Observaciones
                  </h4>
                </div>
                <p className="text-sm text-gray-900">
                  {vehicleDelivery.observations}
                </p>
              </div>
            )}
          </div>

          {/* Información de Guía de Remisión */}
          {vehicleDelivery.shipping_guide && (
            <>
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                  <FileText className="size-5 text-primary" />
                  Guía de Remisión
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-blue-50/50 rounded-lg border border-blue-100">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <FileCheck className="size-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          Número de Documento
                        </p>
                        <p className="text-base font-semibold text-gray-900">
                          {vehicleDelivery.shipping_guide.document_number}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <FileText className="size-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          Tipo de Documento
                        </p>
                        <Badge variant="default">
                          {vehicleDelivery.shipping_guide.document_type ===
                          "GUIA_REMISION"
                            ? "Guía Remisión"
                            : "Guía Traslado"}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Calendar className="size-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          Fecha de Emisión
                        </p>
                        <p className="text-base text-gray-900">
                          {vehicleDelivery.shipping_guide.issue_date
                            ? format(
                                new Date(
                                  vehicleDelivery.shipping_guide.issue_date
                                ),
                                "dd/MM/yyyy",
                                {
                                  locale: es,
                                }
                              )
                            : "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Building2 className="size-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          Tipo de Emisor
                        </p>
                        <Badge variant="outline">
                          {vehicleDelivery.shipping_guide.issuer_type}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <ClipboardList className="size-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          Motivo de Traslado
                        </p>
                        <p className="text-base text-gray-900">
                          {
                            vehicleDelivery.shipping_guide
                              .transfer_reason_description
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Truck className="size-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          Modalidad de Transporte
                        </p>
                        <p className="text-base text-gray-900">
                          {
                            vehicleDelivery.shipping_guide
                              .transfer_modality_description
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información de Transporte */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                  <Truck className="size-5 text-primary" />
                  Información de Transporte
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-blue-50/50 rounded-lg border border-blue-100">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      Placa
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      {vehicleDelivery.shipping_guide.plate || "-"}
                    </p>
                  </div>
                  
                  {isPrivateTransport ? (
                    // Mostrar datos del conductor para transporte privado
                    <>
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          Conductor
                        </p>
                        <p className="text-base text-gray-900">
                          {vehicleDelivery.shipping_guide.driver_name || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          Licencia
                        </p>
                        <p className="text-base text-gray-900">
                          {vehicleDelivery.shipping_guide.license || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          DNI Conductor
                        </p>
                        <p className="text-base text-gray-900">
                          {vehicleDelivery.shipping_guide.driver_doc || "-"}
                        </p>
                      </div>
                    </>
                  ) : isPublicTransport ? (
                    // Mostrar datos del transportista para transporte público
                    <>
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          RUC Transportista
                        </p>
                        <p className="text-base font-semibold text-gray-900">
                          {vehicleDelivery.shipping_guide.ruc_transport || "-"}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          Razón Social Transportista
                        </p>
                        <p className="text-base text-gray-900">
                          {vehicleDelivery.shipping_guide.company_name_transport || "-"}
                        </p>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>

              {/* Origen y Destino */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                  <MapPin className="size-5 text-primary" />
                  Origen y Destino
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Origen */}
                  <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-300 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 bg-primary rounded-lg">
                        <Building2 className="size-4 text-white" />
                      </div>
                      <span className="text-sm font-bold text-primary uppercase tracking-wide">
                        Origen
                      </span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-base font-bold text-gray-900">
                        {vehicleDelivery.shipping_guide.transmitter_name ||
                          vehicleDelivery.shipping_guide.sede_transmitter}
                      </p>
                      {vehicleDelivery.shipping_guide.transmitter_establishment
                        ?.description && (
                        <p className="text-sm font-medium text-primary">
                          {
                            vehicleDelivery.shipping_guide
                              .transmitter_establishment.description
                          }
                        </p>
                      )}
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {vehicleDelivery.shipping_guide
                          .transmitter_establishment?.full_address ||
                          vehicleDelivery.shipping_guide
                            .transmitter_description}
                      </p>
                    </div>
                  </div>

                  {/* Destino */}
                  <div className="p-5 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border-2 border-red-300 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 bg-secondary rounded-lg">
                        <Building2 className="size-4 text-white" />
                      </div>
                      <span className="text-sm font-bold text-red-900 uppercase tracking-wide">
                        Destino
                      </span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-base font-bold text-gray-900">
                        {vehicleDelivery.client_name ||
                          vehicleDelivery.shipping_guide.receiver_name}
                      </p>
                      {vehicleDelivery.shipping_guide.receiver_establishment
                        ?.description && (
                        <p className="text-sm font-medium text-secondary">
                          {vehicleDelivery.shipping_guide.destination_ubigeo}
                        </p>
                      )}
                      {vehicleDelivery.shipping_guide.destination_address ? (
                        <>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            {vehicleDelivery.shipping_guide.destination_address}
                          </p>
                        </>
                      ) : (
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {vehicleDelivery.shipping_guide.receiver_establishment
                            ?.full_address ||
                            vehicleDelivery.shipping_guide.receiver_description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Información de Carga */}
              {(vehicleDelivery.shipping_guide.total_packages ||
                vehicleDelivery.shipping_guide.total_weight) && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                    <Package className="size-5 text-primary" />
                    Información de Carga
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-purple-50/50 rounded-lg border border-purple-100">
                    {vehicleDelivery.shipping_guide.total_packages && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          Total de Paquetes
                        </p>
                        <p className="text-base font-semibold text-gray-900">
                          {vehicleDelivery.shipping_guide.total_packages}
                        </p>
                      </div>
                    )}
                    {vehicleDelivery.shipping_guide.total_weight && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          Peso Total
                        </p>
                        <p className="text-base font-semibold text-gray-900">
                          {vehicleDelivery.shipping_guide.total_weight} kg
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Estado SUNAT de la Guía */}
              {vehicleDelivery.shipping_guide.requires_sunat && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                    <FileCheck className="size-5 text-primary" />
                    Estado SUNAT de la Guía
                  </h3>
                  <div className="p-5 bg-blue-50/50 rounded-lg border border-blue-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Registrado en SUNAT
                      </span>
                      {vehicleDelivery.shipping_guide.is_sunat_registered ? (
                        <CheckCircle2 className="size-5 text-green-600" />
                      ) : (
                        <XCircle className="size-5 text-secondary" />
                      )}
                    </div>
                    {vehicleDelivery.shipping_guide.sent_at && (
                      <div>
                        <span className="text-sm font-medium">
                          Fecha de Envío:{" "}
                        </span>
                        <span className="text-sm">
                          {formatDate(vehicleDelivery.shipping_guide.sent_at)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Aceptado por SUNAT
                      </span>
                      {vehicleDelivery.shipping_guide.aceptada_por_sunat ? (
                        <CheckCircle2 className="size-5 text-green-600" />
                      ) : (
                        <XCircle className="size-5 text-secondary" />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Notas de la Guía */}
              {(vehicleDelivery.shipping_guide.notes ||
                vehicleDelivery.shipping_guide.note_received) && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                    <ClipboardList className="size-5 text-primary" />
                    Notas de la Guía
                  </h3>
                  <div className="space-y-2">
                    {vehicleDelivery.shipping_guide.notes && (
                      <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                        <p className="text-sm font-medium text-primary mb-1">
                          Nota de Guía
                        </p>
                        <p className="text-sm text-gray-900">
                          {vehicleDelivery.shipping_guide.notes}
                        </p>
                      </div>
                    )}
                    {vehicleDelivery.shipping_guide.note_received && (
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-300">
                        <p className="text-sm font-medium text-gray-800 mb-1">
                          Nota de Recepción
                        </p>
                        <p className="text-sm text-gray-900">
                          {vehicleDelivery.shipping_guide.note_received}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Documentos SUNAT de la Guía */}
              {vehicleDelivery.shipping_guide.requires_sunat &&
                vehicleDelivery.shipping_guide.is_sunat_registered &&
                (vehicleDelivery.shipping_guide.enlace_del_pdf ||
                  vehicleDelivery.shipping_guide.enlace_del_xml ||
                  vehicleDelivery.shipping_guide.enlace_del_cdr ||
                  vehicleDelivery.shipping_guide.cadena_para_codigo_qr) && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                      <FileText className="size-5 text-primary" />
                      Documentos SUNAT
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {vehicleDelivery.shipping_guide.enlace_del_pdf && (
                        <Link
                          href={vehicleDelivery.shipping_guide.enlace_del_pdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full"
                        >
                          <Button
                            variant="outline"
                            className="w-full gap-2 h-20 flex-col hover:bg-blue-50 hover:border-blue-300"
                          >
                            <FileText className="size-6 text-secondary" />
                            <span className="text-xs">Ver PDF</span>
                          </Button>
                        </a>
                      )}

                      {vehicleDelivery.shipping_guide.enlace_del_xml && (
                        <Link
                          href={vehicleDelivery.shipping_guide.enlace_del_xml}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full"
                        >
                          <Button
                            variant="outline"
                            className="w-full gap-2 h-20 flex-col hover:bg-blue-50 hover:border-blue-300"
                          >
                            <FileCode className="size-6 text-primary" />
                            <span className="text-xs">Descargar XML</span>
                          </Button>
                        </a>
                      )}

                      {vehicleDelivery.shipping_guide.enlace_del_cdr && (
                        <Link
                          href={vehicleDelivery.shipping_guide.enlace_del_cdr}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full"
                        >
                          <Button
                            variant="outline"
                            className="w-full gap-2 h-20 flex-col hover:bg-blue-50 hover:border-blue-300"
                          >
                            <Download className="size-6 text-primary" />
                            <span className="text-xs">Descargar CDR</span>
                          </Button>
                        </a>
                      )}

                      {vehicleDelivery.shipping_guide.cadena_para_codigo_qr && (
                        <Link
                          href={
                            vehicleDelivery.shipping_guide.cadena_para_codigo_qr
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full"
                        >
                          <Button
                            variant="outline"
                            className="w-full gap-2 h-20 flex-col hover:bg-blue-50 hover:border-blue-300"
                          >
                            <QrCode className="size-6 text-primary" />
                            <span className="text-xs">Ver QR</span>
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
