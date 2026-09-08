import { useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { Badge, BadgeColor } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  User,
  Calendar,
  Package,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  Ban,
  SearchCheck,
  Loader2,
  Car,
  Coins,
  ReceiptText,
  Landmark,
  History,
  LucideIcon,
} from "lucide-react";
import type {
  ElectronicDocumentResource,
  ElectronicDocumentItem,
} from "../lib/electronicDocument.interface";
import { DetailSheetTable } from "@/shared/components/DetailSheetTable";
import { NumberFormat } from "@/shared/components/NumberFormat";
import { queryElectronicDocumentStatus } from "../lib/electronicDocument.actions";
import { useElectronicDocument } from "../lib/electronicDocument.hook";
import { successToast, errorToast } from "@/core/core.function";
import { Link } from "react-router-dom";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { AREA_COMERCIAL } from "@/features/ap/ap-master/lib/apMaster.constants";
import { CopyCell } from "@/shared/components/CopyCell";

interface ElectronicDocumentDetailSheetProps {
  document: ElectronicDocumentResource | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusUpdated?: () => void;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: LucideIcon; color: BadgeColor }
> = {
  draft: { label: "Borrador", icon: FileText, color: "gray" },
  sent: { label: "Enviado", icon: Send, color: "blue" },
  accepted: { label: "Aceptado", icon: CheckCircle, color: "green" },
  rejected: { label: "Rechazado", icon: XCircle, color: "red" },
  cancelled: { label: "Anulado", icon: Ban, color: "orange" },
};

const MIGRATION_LABEL: Record<string, string> = {
  pending: "Migración pendiente",
  in_progress: "Migración en progreso",
  completed: "Migrado a Dynamics",
  failed: "Migración fallida",
};

function fmtDate(value?: string | null, withTime = false) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

/** Fila etiqueta / valor. Se omite si el valor está vacío. */
function Field({
  label,
  value,
  copy,
  fullWidth,
}: {
  label: string;
  value?: React.ReactNode;
  copy?: boolean;
  fullWidth?: boolean;
}) {
  if (
    value === undefined ||
    value === null ||
    value === "" ||
    value === "N/A"
  )
    return null;
  return (
    <div className={fullWidth ? "sm:col-span-2" : undefined}>
      <p className="text-xs text-muted-foreground">{label}</p>
      {copy && (typeof value === "string" || typeof value === "number") ? (
        <CopyCell
          value={String(value)}
          label={String(value)}
          className="text-sm font-medium"
        />
      ) : typeof value === "string" || typeof value === "number" ? (
        <p className="text-sm font-medium break-words">{value}</p>
      ) : (
        value
      )}
    </div>
  );
}

function SectionCard({
  title,
  icon: Icon,
  children,
  action,
}: {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-primary" />}
          {title}
        </h3>
        {action}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-lg bg-muted/30 p-4">
        {children}
      </div>
    </div>
  );
}

export function ElectronicDocumentDetailSheet({
  document,
  open,
  onOpenChange,
  onStatusUpdated,
}: ElectronicDocumentDetailSheetProps) {
  const { data: fetched, isFetching } = useElectronicDocument(
    open && document?.id ? document.id : 0,
  );

  // Mezcla: la fila de la tabla da datos instantáneos, el show() los enriquece.
  const doc = useMemo<ElectronicDocumentResource | null>(() => {
    if (!document) return null;
    return fetched ? { ...document, ...fetched } : document;
  }, [document, fetched]);

  const queryStatusMutation = useMutation({
    mutationFn: (id: number) => queryElectronicDocumentStatus(id),
    onSuccess: () => {
      successToast("Estado consultado exitosamente");
      onStatusUpdated?.();
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(`Error al consultar estado: ${msg}`);
    },
  });

  if (!doc) return null;

  const currencySymbol =
    doc.currency?.iso_code === "PEN"
      ? "S/"
      : doc.currency?.iso_code === "USD"
        ? "$"
        : "";
  const money = (v?: number | string | null) => (
    <NumberFormat value={v ?? 0} prefix={currencySymbol} />
  );

  const config = STATUS_CONFIG[doc.status] ?? STATUS_CONFIG.draft;
  const vehicle = doc.vehicle;
  const quote = doc.purchase_request_quote;
  const items = doc.items ?? [];
  const guides = doc.guides ?? [];
  const installments = doc.installments ?? [];

  const vehicleTitle = vehicle
    ? [vehicle.brand, vehicle.family, vehicle.model_version]
        .filter(Boolean)
        .join(" · ")
    : null;

  const originLabel =
    doc.area_id === AREA_COMERCIAL ? "Comercial" : "Posventa";

  const handleQueryStatus = () => queryStatusMutation.mutate(doc.id);

  return (
    <GeneralSheet
      open={open}
      onClose={() => onOpenChange(false)}
      icon="FileText"
      title="Detalle del Comprobante Electrónico"
      subtitle={`${doc.document_type?.description ?? "Comprobante"} · ${doc.full_number ?? `${doc.serie}-${doc.numero}`}`}
      size="5xl"
    >
      <div className="mt-4 space-y-5">
        {/* Cabecera fija */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {doc.document_type?.description ?? "Comprobante"}
                {isFetching && (
                  <Loader2 className="ml-2 inline h-3 w-3 animate-spin" />
                )}
              </p>
              <CopyCell
                value={doc.full_number ?? `${doc.serie}-${doc.numero}`}
                label={doc.full_number ?? `${doc.serie}-${doc.numero}`}
                size="lg"
                className="font-bold tracking-wide"
              />
              <p className="text-xs text-muted-foreground">
                {[doc.sede_shop, doc.sede_abrev || doc.sede]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <div className="flex flex-wrap justify-end gap-1.5">
              <Badge variant="outline" color={config.color} icon={config.icon}>
                <span>{config.label}</span>
              </Badge>
              <Badge variant="outline">{originLabel}</Badge>
              {doc.is_advance_payment && (
                <Badge variant="outline" color="blue">
                  Anticipo
                </Badge>
              )}
              {doc.re_invoice && (
                <Badge variant="outline" color="orange">
                  Refacturación
                </Badge>
              )}
              {doc.consolidation_type && (
                <Badge variant="outline">
                  {doc.consolidation_type === "massive"
                    ? "Consolidado masivo"
                    : "Consolidado"}
                </Badge>
              )}
              {doc.is_accounted && (
                <Badge variant="outline" color="green">
                  Contabilizado
                </Badge>
              )}
              {doc.migration_status && MIGRATION_LABEL[doc.migration_status] && (
                <Badge
                  variant="outline"
                  color={
                    doc.migration_status === "completed"
                      ? "green"
                      : doc.migration_status === "failed"
                        ? "red"
                        : "gray"
                  }
                >
                  {MIGRATION_LABEL[doc.migration_status]}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {doc.enlace_del_pdf && (
                <Button variant="outline" size="sm" asChild>
                  <Link
                    to={doc.enlace_del_pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Link>
                </Button>
              )}
              {doc.enlace_del_xml && (
                <Button variant="outline" size="sm" asChild>
                  <Link
                    to={doc.enlace_del_xml}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    XML
                  </Link>
                </Button>
              )}
              {doc.enlace_del_cdr && (
                <Button variant="outline" size="sm" asChild>
                  <Link
                    to={doc.enlace_del_cdr}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    CDR
                  </Link>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleQueryStatus}
                disabled={queryStatusMutation.isPending}
              >
                {queryStatusMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <SearchCheck className="h-4 w-4 mr-2" />
                )}
                Consultar a SUNAT
              </Button>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-muted-foreground">Total</p>
              <p className="text-xl font-bold text-primary tabular-nums">
                {money(doc.total)}
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="resumen">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
            <TabsTrigger value="resumen">Resumen</TabsTrigger>
            <TabsTrigger value="cliente">Cliente & Vehículo</TabsTrigger>
            <TabsTrigger value="items">
              Ítems ({items.length})
            </TabsTrigger>
            <TabsTrigger value="impuestos">Impuestos & Pagos</TabsTrigger>
            <TabsTrigger value="sunat">SUNAT & Trazabilidad</TabsTrigger>
          </TabsList>

          {/* ---------------- RESUMEN ---------------- */}
          <TabsContent value="resumen" className="space-y-5 pt-3">
            <SectionCard title="Información del Documento" icon={FileText}>
              <Field
                label="Tipo de Documento"
                value={doc.document_type?.description}
              />
              <Field
                label="Tipo de Operación"
                value={doc.transaction_type?.description}
              />
              <Field label="Serie" value={doc.serie} copy />
              <Field
                label="Número"
                value={String(doc.numero).padStart(8, "0")}
                copy
              />
              <Field label="Sede / Tienda" value={doc.sede_shop} />
              <Field label="Módulo de Origen" value={originLabel} />
            </SectionCard>

            <SectionCard title="Fechas y Emisión" icon={Calendar}>
              <Field
                label="Fecha de Emisión"
                value={fmtDate(doc.fecha_de_emision)}
              />
              <Field
                label="Fecha de Vencimiento"
                value={fmtDate(doc.fecha_de_vencimiento)}
              />
              <Field
                label="Días de Crédito"
                value={doc.credit_days ? `${doc.credit_days} días` : null}
              />
              <Field
                label="Contingencia"
                value={doc.generado_por_contingencia ? "Sí" : null}
              />
              <Field
                label="Envío automático a SUNAT"
                value={
                  doc.enviar_automaticamente_a_la_sunat ? "Sí" : "No"
                }
              />
              <Field
                label="Envío automático al cliente"
                value={
                  doc.enviar_automaticamente_al_cliente ? "Sí" : "No"
                }
              />
            </SectionCard>

            {(quote ||
              doc.order_quotation ||
              doc.work_order ||
              doc.related_document_number ||
              vehicle) && (
              <SectionCard title="Origen y Referencias" icon={ReceiptText}>
                {quote && (
                  <>
                    <Field
                      label="Cotización / Solicitud"
                      value={quote.correlative || quote.internal_code}
                      copy
                    />
                    <Field label="Oportunidad" value={quote.opportunity_code} />
                    <Field label="Asesor" value={quote.advisor} />
                    <Field
                      label="Precio de venta (cotización)"
                      value={money(quote.sale_price)}
                    />
                  </>
                )}
                <Field
                  label={doc.related_document_type || "Documento relacionado"}
                  value={doc.related_document_number}
                />
                <Field
                  label="Cotización posventa"
                  value={doc.order_quotation?.number}
                />
                <Field
                  label="Orden de Trabajo"
                  value={doc.work_order?.number}
                />
                {vehicle && (
                  <Field
                    label="VIN asociado"
                    value={vehicle.vin}
                    copy
                    fullWidth
                  />
                )}
              </SectionCard>
            )}

            <SectionCard title="Totales" icon={Coins}>
              <Field label="Moneda" value={doc.currency?.description} />
              <Field
                label="Tipo de Cambio"
                value={doc.tipo_de_cambio ? doc.tipo_de_cambio : null}
              />
              <Field label="Op. Gravada" value={money(doc.total_gravada)} />
              <Field label="Op. Exonerada" value={money(doc.total_exonerada)} />
              <Field label="Op. Inafecta" value={money(doc.total_inafecta)} />
              <Field label="Op. Gratuita" value={money(doc.total_gratuita)} />
              <Field
                label={`IGV (${doc.porcentaje_de_igv}%)`}
                value={money(doc.total_igv)}
              />
              <Field
                label="Total"
                value={
                  <p className="text-base font-bold text-primary tabular-nums">
                    {money(doc.total)}
                  </p>
                }
              />
            </SectionCard>
          </TabsContent>

          {/* ---------------- CLIENTE & VEHÍCULO ---------------- */}
          <TabsContent value="cliente" className="space-y-5 pt-3">
            <SectionCard title="Información del Cliente" icon={User}>
              <Field
                label="Razón Social / Nombre"
                value={doc.cliente_denominacion}
                fullWidth
              />
              <Field
                label={doc.identity_document_type?.description || "Documento"}
                value={doc.cliente_numero_de_documento}
                copy
              />
              <Field label="Email" value={doc.cliente_email} copy />
              <Field label="Email adicional 1" value={doc.cliente_email_1} />
              <Field label="Email adicional 2" value={doc.cliente_email_2} />
              <Field
                label="Dirección"
                value={doc.cliente_direccion}
                fullWidth
              />
            </SectionCard>

            {vehicle ? (
              <SectionCard
                title="Vehículo Asociado"
                icon={Car}
                action={
                  vehicle.status ? (
                    <span
                      className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                      style={{
                        backgroundColor: vehicle.status_color
                          ? `${vehicle.status_color}22`
                          : undefined,
                        color: vehicle.status_color || undefined,
                      }}
                    >
                      {vehicle.status}
                    </span>
                  ) : undefined
                }
              >
                <Field label="Descripción" value={vehicleTitle} fullWidth />
                <Field label="VIN" value={vehicle.vin} copy />
                <Field label="Placa" value={vehicle.plate} copy />
                <Field
                  label="N° Motor"
                  value={vehicle.engine_number}
                  copy
                />
                <Field label="Código Modelo" value={vehicle.model_code} />
                <Field label="Versión" value={vehicle.model_version} />
                <Field label="Color" value={vehicle.color} />
                <Field label="Tipo de Motor" value={vehicle.engine_type} />
                <Field label="Año" value={vehicle.year} />
                <Field label="Kilometraje" value={vehicle.mileage} />
                <Field label="Almacén físico" value={vehicle.warehouse} />
              </SectionCard>
            ) : (
              <p className="rounded-lg bg-muted/30 p-4 text-sm text-muted-foreground">
                Este comprobante no tiene un vehículo asociado.
              </p>
            )}

            {doc.vehicle_movement && (
              <SectionCard title="Movimiento de Inventario" icon={Package}>
                <Field
                  label="Fecha"
                  value={fmtDate(doc.vehicle_movement.date)}
                />
                <Field
                  label="Estado"
                  value={doc.vehicle_movement.status}
                />
                <Field
                  label="Almacén"
                  value={doc.vehicle_movement.warehouse?.description}
                />
                <Field
                  label="Almacén origen"
                  value={doc.vehicle_movement.origin_warehouse?.description}
                />
                <Field
                  label="Observación"
                  value={doc.vehicle_movement.observation}
                  fullWidth
                />
              </SectionCard>
            )}

            {quote && (
              <SectionCard title="Cotización de Origen" icon={ReceiptText}>
                <Field
                  label="Correlativo"
                  value={quote.correlative || quote.internal_code}
                  copy
                />
                <Field label="Titular" value={quote.holder} />
                <Field label="Oportunidad" value={quote.opportunity_code} />
                <Field label="Asesor" value={quote.advisor} />
                <Field
                  label="Precio base"
                  value={money(quote.base_selling_price)}
                />
                <Field label="Precio de venta" value={money(quote.sale_price)} />
                <Field label="A cuenta" value={money(quote.down_payment)} />
              </SectionCard>
            )}
          </TabsContent>

          {/* ---------------- ITEMS ---------------- */}
          <TabsContent value="items" className="space-y-5 pt-3">
            <DetailSheetTable<ElectronicDocumentItem>
              rows={items}
              getKey={(_, i) => i}
              emptyMessage="El comprobante no tiene ítems registrados."
              columns={[
                {
                  header: "Descripción",
                  render: (item) => (
                    <div className="space-y-0.5">
                      <div className="text-xs font-medium whitespace-pre-line">
                        {item.descripcion}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.unidad_de_medida}
                        {item.igv_type?.description || item.igvType?.description
                          ? ` · ${item.igv_type?.description ?? item.igvType?.description}`
                          : ""}
                      </div>
                      {item.codigo && !doc.is_advance_payment && (
                        <CopyCell
                          value={item.codigo}
                          label={`Cód: ${item.codigo}`}
                          className="text-xs text-muted-foreground"
                        />
                      )}
                      {item.dyn_code && (
                        <CopyCell
                          value={item.dyn_code}
                          label={`Dyn: ${item.dyn_code}`}
                          className="text-xs text-muted-foreground"
                        />
                      )}
                      {item.codigo_producto_sunat && (
                        <div className="text-xs text-muted-foreground">
                          SUNAT: {item.codigo_producto_sunat}
                        </div>
                      )}
                      {!!item.anticipo_regularizacion &&
                        !!item.anticipo_documento_serie && (
                          <div className="text-xs text-blue-600">
                            Regulariza anticipo{" "}
                            {item.anticipo_documento_serie}-
                            {item.anticipo_documento_numero}
                          </div>
                        )}
                    </div>
                  ),
                },
                {
                  header: "Cant.",
                  className: "text-center",
                  render: (item) => item.cantidad,
                },
                {
                  header: "V. Unit.",
                  className: "text-right",
                  render: (item) => money(item.valor_unitario),
                },
                {
                  header: "P. Unit.",
                  className: "text-right",
                  render: (item) => money(item.precio_unitario),
                },
                {
                  header: "Dscto.",
                  className: "text-right",
                  render: (item) =>
                    item.descuento ? money(item.descuento) : "—",
                },
                {
                  header: "IGV",
                  className: "text-right",
                  render: (item) => money(item.igv),
                },
                {
                  header: "Total",
                  className: "text-right",
                  render: (item) => (
                    <span className="font-medium">{money(item.total)}</span>
                  ),
                },
              ]}
              footer={
                <div className="flex flex-col gap-1 rounded-lg border border-primary/20 bg-primary/5 px-5 py-4 sm:ml-auto sm:w-[280px]">
                  {!!doc.total_descuento && (
                    <Row label="Descuento" value={money(doc.total_descuento)} />
                  )}
                  {!!doc.total_gravada && (
                    <Row label="Op. Gravada" value={money(doc.total_gravada)} />
                  )}
                  {!!doc.total_exonerada && (
                    <Row
                      label="Op. Exonerada"
                      value={money(doc.total_exonerada)}
                    />
                  )}
                  {!!doc.total_inafecta && (
                    <Row
                      label="Op. Inafecta"
                      value={money(doc.total_inafecta)}
                    />
                  )}
                  {!!doc.total_gratuita && (
                    <Row
                      label="Op. Gratuita"
                      value={money(doc.total_gratuita)}
                    />
                  )}
                  {!!doc.total_anticipo && (
                    <Row
                      label="Anticipos"
                      value={money(doc.total_anticipo)}
                    />
                  )}
                  {!!doc.total_otros_cargos && (
                    <Row
                      label="Otros cargos"
                      value={money(doc.total_otros_cargos)}
                    />
                  )}
                  <Row
                    label={`IGV (${doc.porcentaje_de_igv}%)`}
                    value={money(doc.total_igv)}
                  />
                  <Separator className="my-1.5" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-primary">
                      Total
                    </span>
                    <span className="text-lg font-bold text-primary tabular-nums">
                      {money(doc.total)}
                    </span>
                  </div>
                </div>
              }
            />

            {guides.length > 0 && (
              <SectionCard title="Guías de Remisión" icon={ReceiptText}>
                {guides.map((g) => (
                  <Field
                    key={g.id ?? g.guia_serie_numero}
                    label={g.guia_tipo_descripcion || `Tipo ${g.guia_tipo}`}
                    value={g.guia_serie_numero}
                    copy
                  />
                ))}
              </SectionCard>
            )}

            {installments.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Cuotas ({installments.length})
                </h3>
                <DetailSheetTable
                  rows={installments}
                  getKey={(_, i) => i}
                  columns={[
                    {
                      header: "Cuota",
                      render: (r) => r.cuota,
                    },
                    {
                      header: "Fecha de pago",
                      render: (r) => fmtDate(r.fecha_de_pago),
                    },
                    {
                      header: "Importe",
                      className: "text-right",
                      render: (r) => money(r.importe),
                    },
                  ]}
                />
              </div>
            )}
          </TabsContent>

          {/* ---------------- IMPUESTOS & PAGOS ---------------- */}
          <TabsContent value="impuestos" className="space-y-5 pt-3">
            <SectionCard title="Moneda y Tipo de Cambio" icon={Coins}>
              <Field label="Moneda" value={doc.currency?.description} />
              <Field label="Tipo de Cambio" value={doc.tipo_de_cambio} />
              <Field
                label="Tasa registrada"
                value={
                  doc.exchange_rate
                    ? `${doc.exchange_rate.rate} (${doc.exchange_rate.type})`
                    : null
                }
              />
              <Field
                label="Fecha tipo de cambio"
                value={fmtDate(doc.exchange_rate?.date)}
              />
              <Field label="% IGV" value={`${doc.porcentaje_de_igv}%`} />
              <Field
                label="Descuento global"
                value={
                  doc.descuento_global ? money(doc.descuento_global) : null
                }
              />
            </SectionCard>

            <SectionCard title="Desglose de Importes" icon={Coins}>
              <Field label="Op. Gravada" value={money(doc.total_gravada)} />
              <Field label="Op. Exonerada" value={money(doc.total_exonerada)} />
              <Field label="Op. Inafecta" value={money(doc.total_inafecta)} />
              <Field label="Op. Gratuita" value={money(doc.total_gratuita)} />
              <Field label="Total Descuento" value={money(doc.total_descuento)} />
              <Field label="Total Anticipos" value={money(doc.total_anticipo)} />
              <Field
                label="Otros Cargos"
                value={money(doc.total_otros_cargos)}
              />
              <Field label="ISC" value={money(doc.total_isc)} />
              <Field label="IGV" value={money(doc.total_igv)} />
              <Field
                label="Importe neto"
                value={
                  doc.net_amount != null ? money(doc.net_amount) : null
                }
              />
              <Field
                label="Total"
                value={
                  <p className="text-base font-bold text-primary tabular-nums">
                    {money(doc.total)}
                  </p>
                }
              />
            </SectionCard>

            {(doc.detraccion ||
              !!doc.total_percepcion ||
              !!doc.total_retencion) && (
              <SectionCard title="Detracción / Percepción / Retención" icon={Landmark}>
                {doc.detraccion && (
                  <>
                    <Field
                      label="Detracción %"
                      value={
                        doc.detraccion_porcentaje
                          ? `${doc.detraccion_porcentaje}%`
                          : null
                      }
                    />
                    <Field
                      label="Monto Detracción"
                      value={money(doc.detraccion_total)}
                    />
                    <Field
                      label="Medio de pago detracción"
                      value={doc.medio_de_pago_detraccion}
                    />
                  </>
                )}
                {!!doc.total_percepcion && (
                  <>
                    <Field
                      label="Base Percepción"
                      value={money(doc.percepcion_base_imponible)}
                    />
                    <Field
                      label="Total Percepción"
                      value={money(doc.total_percepcion)}
                    />
                    <Field
                      label="Total incluido percepción"
                      value={money(doc.total_incluido_percepcion)}
                    />
                  </>
                )}
                {!!doc.total_retencion && (
                  <>
                    <Field
                      label="Base Retención"
                      value={money(doc.retencion_base_imponible)}
                    />
                    <Field
                      label="Total Retención"
                      value={money(doc.total_retencion)}
                    />
                  </>
                )}
              </SectionCard>
            )}

            <SectionCard title="Condiciones y Medios de Pago" icon={Landmark}>
              <Field
                label="Condiciones de Pago"
                value={doc.condiciones_de_pago}
              />
              <Field label="Medio de Pago" value={doc.medio_de_pago} />
              <Field label="Tipo de Financiamiento" value={doc.financing_type} />
              <Field label="N° de Operación" value={doc.operation_number} />
              <Field label="Banco / Chequera" value={doc.bank?.code} />
              <Field
                label="Tarjeta (últimos 4)"
                value={doc.card_last4}
              />
              <Field
                label="Orden de Compra / Servicio"
                value={
                  doc.orden_compra_servicio_url ? (
                    <a
                      href={doc.orden_compra_servicio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-primary underline"
                    >
                      {doc.orden_compra_servicio || "Ver archivo"}
                    </a>
                  ) : (
                    doc.orden_compra_servicio
                  )
                }
                fullWidth
              />
            </SectionCard>
          </TabsContent>

          {/* ---------------- SUNAT & TRAZABILIDAD ---------------- */}
          <TabsContent value="sunat" className="space-y-5 pt-3">
            <div className="space-y-3">
              <h3 className="font-semibold">Estado SUNAT</h3>
              <div className="space-y-2 rounded-lg bg-muted/30 p-4">
                <div className="flex items-center gap-2">
                  {doc.aceptada_por_sunat === true &&
                  doc.status !== "draft" ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">
                        Aceptado por SUNAT
                      </span>
                    </>
                  ) : doc.aceptada_por_sunat === false &&
                    doc.status !== "draft" ? (
                    <>
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-600">
                        Rechazado por SUNAT
                      </span>
                    </>
                  ) : (
                    <>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Pendiente de envío
                      </span>
                    </>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-1">
                  <Field
                    label="Código de respuesta"
                    value={doc.sunat_responsecode}
                  />
                  <Field label="Descripción" value={doc.sunat_description} />
                  <Field label="Nota SUNAT" value={doc.sunat_note} />
                  <Field
                    label="Error SOAP"
                    value={doc.sunat_soap_error}
                    fullWidth
                  />
                  <Field
                    label="Mensaje de error"
                    value={doc.error_message}
                    fullWidth
                  />
                  <Field label="Anulado" value={doc.anulado ? "Sí" : null} />
                  <Field
                    label="Anulado en Dynamics"
                    value={doc.was_dyn_requested ? "Sí" : null}
                  />
                </div>
              </div>
            </div>

            <SectionCard title="Identificadores" icon={FileText}>
              <Field label="Código Único" value={doc.codigo_unico} copy />
              <Field label="Hash" value={doc.codigo_hash} copy />
              <Field
                label="Enlace público"
                value={
                  doc.enlace ? (
                    <a
                      href={doc.enlace}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-primary underline break-all"
                    >
                      {doc.enlace}
                    </a>
                  ) : null
                }
                fullWidth
              />
              <Field
                label="Cadena para código QR"
                value={
                  doc.cadena_para_codigo_qr ? (
                    <p className="text-xs font-mono break-all">
                      {doc.cadena_para_codigo_qr}
                    </p>
                  ) : null
                }
                fullWidth
              />
            </SectionCard>

            {(doc.documento_que_se_modifica_serie ||
              doc.original_document ||
              doc.credit_note_number ||
              doc.debit_note_number) && (
              <SectionCard title="Documentos Vinculados" icon={ReceiptText}>
                <Field
                  label="Documento que modifica"
                  value={
                    doc.documento_que_se_modifica_serie &&
                    doc.documento_que_se_modifica_numero
                      ? `${doc.documento_que_se_modifica_serie}-${doc.documento_que_se_modifica_numero}`
                      : null
                  }
                />
                <Field
                  label="Documento original"
                  value={
                    doc.original_document
                      ? `${doc.original_document.document_type ?? ""} ${doc.original_document.full_number}`.trim()
                      : null
                  }
                />
                <Field
                  label="Nota de Crédito"
                  value={
                    doc.credit_note_number
                      ? `${doc.credit_note_number}${
                          doc.credit_note_total
                            ? ` · ${currencySymbol} ${doc.credit_note_total}`
                            : ""
                        }`
                      : null
                  }
                />
                <Field
                  label="Nota de Débito"
                  value={
                    doc.debit_note_number
                      ? `${doc.debit_note_number}${
                          doc.debit_note_total
                            ? ` · ${currencySymbol} ${doc.debit_note_total}`
                            : ""
                        }`
                      : null
                  }
                />
              </SectionCard>
            )}

            <SectionCard title="Auditoría" icon={History}>
              <Field
                label="Creado por"
                value={doc.creator_name}
              />
              <Field
                label="Actualizado por"
                value={doc.updater_name}
              />
              <Field
                label="Fecha de creación"
                value={fmtDate(doc.created_at, true)}
              />
              <Field
                label="Última actualización"
                value={fmtDate(doc.updated_at, true)}
              />
              <Field label="Enviado" value={fmtDate(doc.sent_at, true)} />
              <Field label="Aceptado" value={fmtDate(doc.accepted_at, true)} />
              <Field label="Anulado" value={fmtDate(doc.cancelled_at, true)} />
              <Field label="Migrado" value={fmtDate(doc.migrated_at, true)} />
            </SectionCard>

            {(doc.observaciones || doc.internal_note) && (
              <div className="space-y-3">
                {doc.observaciones && (
                  <div className="space-y-1">
                    <h3 className="font-semibold">Observaciones</h3>
                    <p className="rounded-lg bg-muted/30 p-3 text-sm whitespace-pre-wrap text-muted-foreground">
                      {doc.observaciones}
                    </p>
                  </div>
                )}
                {doc.internal_note && (
                  <div className="space-y-1">
                    <h3 className="font-semibold">Comentario interno</h3>
                    <p className="rounded-lg bg-muted/30 p-3 text-sm whitespace-pre-wrap text-muted-foreground">
                      {doc.internal_note}
                    </p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </GeneralSheet>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  );
}
