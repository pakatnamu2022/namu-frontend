import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SUNAT_CONCEPTS_ID } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.constants";
import { CopyCell } from "@/shared/components/CopyCell";
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
  Loader2,
  QrCode,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useVehicleDeliveryById } from "../lib/vehicleDelivery.hook";
import { VehiclesDeliveryResource } from "../lib/vehicleDelivery.interface";

interface VehicleDeliveryDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicleDelivery: VehiclesDeliveryResource | null;
  onQueryFromNubefact?: (id: number) => void;
  isQueryingFromNubefact?: boolean;
}

const sunatStatusConfig = {
  accepted: {
    label: "Aceptado por SUNAT",
    icon: CheckCircle,
    className: "text-emerald-600",
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

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="py-4">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  copy,
  fullWidth,
}: {
  label: string;
  value?: string | number | null;
  copy?: boolean;
  fullWidth?: boolean;
}) {
  if (value === undefined || value === null || value === "" || value === "-")
    return null;
  return (
    <div
      className={
        fullWidth
          ? "py-1.5"
          : "flex items-center justify-between gap-3 py-1.5"
      }
    >
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      {copy ? (
        <CopyCell
          value={String(value)}
          size="sm"
          className={
            fullWidth
              ? "mt-0.5 block font-medium"
              : "truncate text-right font-medium"
          }
        />
      ) : (
        <span
          className={
            fullWidth
              ? "mt-0.5 block text-sm font-medium"
              : "truncate text-right text-sm font-medium"
          }
        >
          {value}
        </span>
      )}
    </div>
  );
}

export function VehicleDeliveryDetailsSheet({
  open,
  onOpenChange,
  vehicleDelivery: initialVehicle,
  onQueryFromNubefact,
  isQueryingFromNubefact,
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
  const vehicle = vehicleDelivery?.vehicle;
  const model = vehicle?.model;

  const modelSummary = model
    ? [model.brand, model.family, model.version].filter(Boolean).join(" · ")
    : undefined;

  const hasSunatFiles =
    guide?.requires_sunat &&
    guide.is_sunat_registered &&
    (guide.enlace_del_pdf ||
      guide.enlace_del_xml ||
      guide.enlace_del_cdr ||
      guide.cadena_para_codigo_qr);

  return (
    <GeneralSheet
      open={open}
      onClose={() => onOpenChange(false)}
      title="Detalles de Entrega de Vehículo"
      subtitle={
        vehicleDelivery ? `VIN: ${vehicleDelivery.vin || "N/A"}` : undefined
      }
      icon="Truck"
      size="4xl"
    >
      {isLoading ? null : (
        vehicleDelivery && (
          <div className="text-sm">
            {/* Hero */}
            <div className="flex items-start justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {modelSummary || "Vehículo"}
                </p>
                <p className="truncate text-lg font-bold tracking-wide">
                  {vehicle?.plate || vehicleDelivery.vin || "-"}
                </p>
                {vehicleDelivery.client_name && (
                  <p className="truncate text-xs text-muted-foreground">
                    {vehicleDelivery.client_name}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                {vehicle?.vehicle_status && (
                  <Badge
                    variant="outline"
                    style={{ color: vehicle.status_color }}
                  >
                    {vehicle.vehicle_status}
                  </Badge>
                )}
                {sunatConfig && SunatIcon && (
                  <div className="flex items-center gap-1.5">
                    <SunatIcon
                      className={`h-3.5 w-3.5 ${sunatConfig.className}`}
                    />
                    <span
                      className={`text-xs font-medium ${sunatConfig.className}`}
                    >
                      {sunatConfig.label}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <Tabs defaultValue="vehicle" className="mt-3">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="vehicle" className="gap-1.5">
                  <Car className="h-3.5 w-3.5" />
                  Vehículo
                </TabsTrigger>
                <TabsTrigger value="guide" className="gap-1.5">
                  <FileCheck className="h-3.5 w-3.5" />
                  Guía de Remisión
                </TabsTrigger>
              </TabsList>

              {/* TAB: VEHÍCULO */}
              <TabsContent value="vehicle" className="divide-y divide-border">
                <Section title="Entrega">
                  <div className="grid grid-cols-2 gap-x-4">
                    <Field label="Sede" value={vehicleDelivery.sede_name} />
                    <Field
                      label="Asesor"
                      value={vehicleDelivery.advisor_name}
                    />
                    <Field
                      label="Fecha lavado"
                      value={formatDateOnly(vehicleDelivery.wash_date)}
                    />
                    <Field
                      label="Entrega programada"
                      value={formatDateOnly(
                        vehicleDelivery.scheduled_delivery_date
                      )}
                    />
                  </div>
                  {vehicleDelivery.observations && (
                    <div className="mt-1.5">
                      <p className="text-xs text-muted-foreground">
                        Observaciones
                      </p>
                      <p className="mt-0.5 text-sm">
                        {vehicleDelivery.observations}
                      </p>
                    </div>
                  )}
                </Section>

                {vehicle && (
                  <Section title="Ficha del vehículo">
                    <div className="grid grid-cols-2 gap-x-4">
                      <Field label="VIN" value={vehicle.vin} copy />
                      <Field label="Placa" value={vehicle.plate} copy />
                      <Field
                        label="N° de motor"
                        value={vehicle.engine_number}
                        copy
                      />
                      <Field label="Año" value={vehicle.year} />
                      <Field
                        label="Año de entrega"
                        value={vehicle.year_delivery}
                      />
                      <Field label="Color" value={vehicle.vehicle_color} />
                      <Field
                        label="Tipo de motor"
                        value={vehicle.engine_type}
                      />
                      <Field label="Kilometraje" value={vehicle.mileage} />
                      <Field
                        label="Almacén físico"
                        value={vehicle.warehouse_physical_name}
                      />
                    </div>
                  </Section>
                )}

                {model && (
                  <Section title="Información del modelo">
                    <div className="grid grid-cols-2 gap-x-4">
                      <Field label="Marca" value={model.brand} />
                      <Field label="Familia" value={model.family} />
                      <Field label="Versión" value={model.version} />
                      <Field label="Código" value={model.code} />
                      <Field label="Año modelo" value={model.model_year} />
                      <Field label="Clase" value={model.class} />
                      <Field label="Combustible" value={model.fuel} />
                      <Field label="Carrocería" value={model.body_type} />
                      <Field
                        label="Transmisión"
                        value={model.transmission}
                      />
                      <Field label="Tracción" value={model.traction_type} />
                      <Field label="N° asientos" value={model.seats_number} />
                      <Field label="N° puertas" value={model.doors_number} />
                    </div>
                  </Section>
                )}
              </TabsContent>

              {/* TAB: GUÍA */}
              <TabsContent value="guide" className="divide-y divide-border">
                {!guide ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No hay guía de remisión asociada a esta entrega.
                  </div>
                ) : (
                  <>
                    {(hasSunatFiles || onQueryFromNubefact) && (
                      <Section title="Estado SUNAT">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {sunatConfig && SunatIcon && (
                              <>
                                <SunatIcon
                                  className={`h-4 w-4 ${sunatConfig.className}`}
                                />
                                <span
                                  className={`text-sm font-medium ${sunatConfig.className}`}
                                >
                                  {sunatConfig.label}
                                </span>
                              </>
                            )}
                          </div>
                          {onQueryFromNubefact &&
                            guide.requires_sunat &&
                            guide.is_sunat_registered && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7"
                                disabled={isQueryingFromNubefact}
                                onClick={() =>
                                  onQueryFromNubefact(vehicleDelivery.id)
                                }
                              >
                                {isQueryingFromNubefact ? (
                                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                ) : (
                                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                                )}
                                Consultar
                              </Button>
                            )}
                        </div>
                        {hasSunatFiles && (
                          <div className="mt-2 flex flex-wrap gap-2">
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
                                  XML
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
                                  CDR
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
                                  QR
                                </Link>
                              </Button>
                            )}
                          </div>
                        )}
                      </Section>
                    )}

                    <Section title="Datos generales">
                      <div className="grid grid-cols-2 gap-x-4">
                        <Field
                          label="N° de documento"
                          value={guide.document_number}
                          copy
                        />
                        <Field
                          label="Tipo de documento"
                          value={
                            guide.document_type === "GUIA_REMISION"
                              ? "Guía de Remisión"
                              : "Guía de Traslado"
                          }
                        />
                        <Field
                          label="Fecha de emisión"
                          value={
                            guide.issue_date
                              ? new Date(guide.issue_date).toLocaleDateString(
                                  "es-PE",
                                  {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                  }
                                )
                              : "-"
                          }
                        />
                        <Field
                          label="Tipo de emisor"
                          value={guide.issuer_type}
                        />
                        <Field
                          label="Motivo de traslado"
                          value={guide.transfer_reason_description}
                        />
                        <Field
                          label="Modalidad de transporte"
                          value={guide.transfer_modality_description}
                        />
                      </div>
                    </Section>

                    <Section title="Transporte">
                      <div className="grid grid-cols-2 gap-x-4">
                        <Field label="Placa" value={guide.plate} copy />
                        {isPrivateTransport ? (
                          <>
                            <Field
                              label="Conductor"
                              value={guide.driver_name}
                            />
                            <Field label="Licencia" value={guide.license} />
                            <Field
                              label="DNI conductor"
                              value={guide.driver_doc}
                              copy
                            />
                          </>
                        ) : isPublicTransport ? (
                          <>
                            <Field
                              label="RUC transportista"
                              value={guide.ruc_transport}
                              copy
                            />
                            <Field
                              label="Razón social"
                              value={guide.company_name_transport}
                            />
                          </>
                        ) : null}
                      </div>
                    </Section>

                    <Section title="Origen y destino">
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center pt-1">
                          <div className="h-2.5 w-2.5 rounded-full bg-foreground" />
                          <div className="my-1 w-px flex-1 bg-border" />
                          <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground" />
                        </div>
                        <div className="flex-1 space-y-3">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">
                              Origen
                            </p>
                            <p className="text-sm font-semibold">
                              {guide.transmitter_name ||
                                guide.sede_transmitter}
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
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">
                              Destino
                            </p>
                            <p className="text-sm font-semibold">
                              {vehicleDelivery.client_name ||
                                guide.receiver_name}
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
                    </Section>

                    {(guide.total_packages || guide.total_weight) && (
                      <Section title="Carga">
                        <div className="grid grid-cols-2 gap-x-4">
                          <Field
                            label="Total de paquetes"
                            value={guide.total_packages}
                          />
                          <Field
                            label="Peso total"
                            value={
                              guide.total_weight
                                ? `${guide.total_weight} kg`
                                : undefined
                            }
                          />
                        </div>
                      </Section>
                    )}

                    {(guide.notes || guide.note_received) && (
                      <Section title="Notas">
                        <div className="space-y-2">
                          {guide.notes && (
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Nota de guía
                              </p>
                              <p className="mt-0.5 text-sm">{guide.notes}</p>
                            </div>
                          )}
                          {guide.note_received && (
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Nota de recepción
                              </p>
                              <p className="mt-0.5 text-sm">
                                {guide.note_received}
                              </p>
                            </div>
                          )}
                        </div>
                      </Section>
                    )}
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )
      )}
    </GeneralSheet>
  );
}
