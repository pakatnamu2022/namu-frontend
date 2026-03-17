import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SUNAT_CONCEPTS_ID } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.constants";
import FormSkeleton from "@/shared/components/FormSkeleton";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Car,
  CheckCircle,
  Clock,
  Download,
  FileCheck,
  FileCode,
  FileText,
  MapPin,
  Package,
  QrCode,
  Truck,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useVehicleDeliveryById } from "../lib/vehicleDelivery.hook";
import { VehiclesDeliveryResource } from "../lib/vehicleDelivery.interface";

interface VehicleDeliveryDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicleDelivery: VehiclesDeliveryResource | null;
}

const sunatStatusConfig = {
  accepted: {
    label: "Aceptado por SUNAT",
    icon: CheckCircle,
    className: "text-green-600",
  },
  rejected: {
    label: "Rechazado por SUNAT",
    icon: XCircle,
    className: "text-red-600",
  },
  pending: {
    label: "Pendiente de envío",
    icon: Clock,
    className: "text-muted-foreground",
  },
};

export function VehicleDeliveryDetailsSheet({
  open,
  onOpenChange,
  vehicleDelivery: initialVehicle,
}: VehicleDeliveryDetailsSheetProps) {
  const vehicleId = initialVehicle?.id || 0;

  const { data: vehicleDelivery } = useVehicleDeliveryById(
    vehicleId,
    open && vehicleId > 0
  );

  const isLoading = !vehicleDelivery && !!initialVehicle;

  const isPublicTransport =
    vehicleDelivery?.shipping_guide?.transfer_modality_id ===
    SUNAT_CONCEPTS_ID.TYPE_TRANSPORTATION_PUBLIC;
  const isPrivateTransport =
    vehicleDelivery?.shipping_guide?.transfer_modality_id ===
    SUNAT_CONCEPTS_ID.TYPE_TRANSPORTATION_PRIVATE;

  const getSunatStatus = (): keyof typeof sunatStatusConfig | null => {
    if (!vehicleDelivery?.shipping_guide?.requires_sunat) return null;
    if (vehicleDelivery.shipping_guide.aceptada_por_sunat === true)
      return "accepted";
    if (vehicleDelivery.shipping_guide.aceptada_por_sunat === false)
      return "rejected";
    return "pending";
  };

  const sunatStatus = getSunatStatus();
  const sunatConfig = sunatStatus ? sunatStatusConfig[sunatStatus] : null;
  const SunatIcon = sunatConfig?.icon;

  const formatDateOnly = (date: string | Date | null | undefined) => {
    if (!date) return "-";
    try {
      const parsedDate = typeof date === "string" ? new Date(date) : date;
      return format(parsedDate, "dd/MM/yyyy", { locale: es });
    } catch {
      return "-";
    }
  };

  const guide = vehicleDelivery?.shipping_guide;

  return (
    <GeneralSheet
      open={open}
      onClose={() => onOpenChange(false)}
      title="Detalles de Entrega de Vehículo"
      subtitle={
        vehicleDelivery ? `VIN: ${vehicleDelivery.vin || "N/A"}` : undefined
      }
      icon="Truck"
      size="5xl"
    >
      {isLoading ? (
        <FormSkeleton />
      ) : (
        vehicleDelivery && (
          <div className="space-y-3">
            {/* VIN y Estado SUNAT */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">VIN</p>
                <p className="text-sm font-semibold">
                  {vehicleDelivery.vin || "-"}
                </p>
              </div>
              {sunatConfig && SunatIcon && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Estado SUNAT</p>
                  <div className="flex items-center gap-1">
                    <SunatIcon
                      className={`h-4 w-4 ${sunatConfig.className}`}
                    />
                    <span
                      className={`text-sm font-medium ${sunatConfig.className}`}
                    >
                      {sunatConfig.label}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Archivos SUNAT */}
            {guide?.requires_sunat &&
              guide.is_sunat_registered &&
              (guide.enlace_del_pdf ||
                guide.enlace_del_xml ||
                guide.enlace_del_cdr ||
                guide.cadena_para_codigo_qr) && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="font-semibold">Archivos Disponibles</h3>
                    <div className="flex flex-wrap gap-2">
                      {guide.enlace_del_pdf && (
                        <Button variant="outline" size="sm" asChild>
                          <Link
                            to={guide.enlace_del_pdf}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Ver PDF
                          </Link>
                        </Button>
                      )}
                      {guide.enlace_del_xml && (
                        <Button variant="outline" size="sm" asChild>
                          <Link
                            to={guide.enlace_del_xml}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FileCode className="h-4 w-4 mr-2" />
                            Descargar XML
                          </Link>
                        </Button>
                      )}
                      {guide.enlace_del_cdr && (
                        <Button variant="outline" size="sm" asChild>
                          <Link
                            to={guide.enlace_del_cdr}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Descargar CDR
                          </Link>
                        </Button>
                      )}
                      {guide.cadena_para_codigo_qr && (
                        <Button variant="outline" size="sm" asChild>
                          <Link
                            to={guide.cadena_para_codigo_qr}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <QrCode className="h-4 w-4 mr-2" />
                            Ver QR
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              )}

            <Separator />

            {/* Información del Vehículo */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">Información del Vehículo</h3>
              </div>
              <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Sede</p>
                    <p className="text-sm font-medium">
                      {vehicleDelivery.sede_name || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Asesor</p>
                    <p className="text-sm font-medium">
                      {vehicleDelivery.advisor_name || "-"}
                    </p>
                  </div>
                  {vehicleDelivery.client_name && (
                    <div>
                      <p className="text-xs text-muted-foreground">Cliente</p>
                      <p className="text-sm font-medium">
                        {vehicleDelivery.client_name}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Fecha Lavado
                    </p>
                    <p className="text-sm font-medium">
                      {formatDateOnly(vehicleDelivery.wash_date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Entrega Programada
                    </p>
                    <p className="text-sm font-medium">
                      {formatDateOnly(vehicleDelivery.scheduled_delivery_date)}
                    </p>
                  </div>
                </div>
                {vehicleDelivery.observations && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Observaciones
                      </p>
                      <p className="text-sm">{vehicleDelivery.observations}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {guide && (
              <>
                <Separator />

                {/* Información General de la Guía */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">Guía de Remisión</h3>
                  </div>
                  <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Número de Documento
                        </p>
                        <p className="text-sm font-medium">
                          {guide.document_number}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Tipo de Documento
                        </p>
                        <Badge variant="outline" className="mt-1">
                          {guide.document_type === "GUIA_REMISION"
                            ? "Guía de Remisión"
                            : "Guía de Traslado"}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Fecha de Emisión
                        </p>
                        <p className="text-sm font-medium">
                          {guide.issue_date
                            ? new Date(guide.issue_date).toLocaleDateString(
                                "es-PE",
                                {
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric",
                                }
                              )
                            : "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Tipo de Emisor
                        </p>
                        <p className="text-sm font-medium">
                          {guide.issuer_type}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Motivo de Traslado
                        </p>
                        <p className="text-sm font-medium">
                          {guide.transfer_reason_description || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Modalidad de Transporte
                        </p>
                        <p className="text-sm font-medium">
                          {guide.transfer_modality_description || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Información de Transporte */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">Información de Transporte</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-4 bg-muted/30 p-4 rounded-lg">
                    <div>
                      <p className="text-xs text-muted-foreground">Placa</p>
                      <p className="text-sm font-semibold">
                        {guide.plate || "-"}
                      </p>
                    </div>
                    {isPrivateTransport ? (
                      <>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Conductor
                          </p>
                          <p className="text-sm font-medium">
                            {guide.driver_name || "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Licencia
                          </p>
                          <p className="text-sm font-medium">
                            {guide.license || "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            DNI Conductor
                          </p>
                          <p className="text-sm font-medium">
                            {guide.driver_doc || "-"}
                          </p>
                        </div>
                      </>
                    ) : isPublicTransport ? (
                      <>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            RUC Transportista
                          </p>
                          <p className="text-sm font-semibold">
                            {guide.ruc_transport || "-"}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-muted-foreground">
                            Razón Social Transportista
                          </p>
                          <p className="text-sm font-medium">
                            {guide.company_name_transport || "-"}
                          </p>
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>

                <Separator />

                {/* Origen y Destino */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold">Origen y Destino</h3>
                  </div>
                  <div className="flex gap-4">
                    {/* Timeline */}
                    <div className="flex flex-col items-center pt-1">
                      <div className="w-3 h-3 rounded-full bg-foreground ring-2 ring-background ring-offset-1 ring-offset-foreground/20" />
                      <div className="w-px flex-1 bg-border my-1" />
                      <div className="w-3 h-3 rounded-full bg-muted-foreground ring-2 ring-background ring-offset-1 ring-offset-muted-foreground/20" />
                    </div>
                    {/* Content */}
                    <div className="flex-1 space-y-3">
                      <div className="rounded-lg border bg-card p-3 space-y-0.5">
                        <p className="text-xs text-muted-foreground font-medium">Origen</p>
                        <p className="text-sm font-semibold">
                          {guide.transmitter_name || guide.sede_transmitter}
                        </p>
                        {guide.transmitter_establishment?.description && (
                          <p className="text-xs text-muted-foreground">
                            {guide.transmitter_establishment.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {guide.transmitter_establishment?.full_address ||
                            guide.transmitter_description ||
                            "-"}
                        </p>
                      </div>
                      <div className="rounded-lg border bg-card p-3 space-y-0.5">
                        <p className="text-xs text-muted-foreground font-medium">Destino</p>
                        <p className="text-sm font-semibold">
                          {vehicleDelivery.client_name || guide.receiver_name}
                        </p>
                        {guide.receiver_establishment?.description && (
                          <p className="text-xs text-muted-foreground">
                            {guide.destination_ubigeo}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {guide.destination_address ||
                            guide.receiver_establishment?.full_address ||
                            guide.receiver_description ||
                            "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información de Carga */}
                {(guide.total_packages || guide.total_weight) && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-primary" />
                        <h3 className="font-semibold">
                          Información de Carga
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
                        {guide.total_packages && (
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Total de Paquetes
                            </p>
                            <p className="text-sm font-semibold">
                              {guide.total_packages}
                            </p>
                          </div>
                        )}
                        {guide.total_weight && (
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Peso Total
                            </p>
                            <p className="text-sm font-semibold">
                              {guide.total_weight} kg
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Notas de la Guía */}
                {(guide.notes || guide.note_received) && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h3 className="font-semibold">Notas</h3>
                      <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
                        {guide.notes && (
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Nota de Guía
                            </p>
                            <p className="text-sm">{guide.notes}</p>
                          </div>
                        )}
                        {guide.notes && guide.note_received && <Separator />}
                        {guide.note_received && (
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Nota de Recepción
                            </p>
                            <p className="text-sm">{guide.note_received}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )
      )}
    </GeneralSheet>
  );
}
