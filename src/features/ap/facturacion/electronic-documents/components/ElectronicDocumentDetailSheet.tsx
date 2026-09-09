import { useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { Badge, BadgeColor } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  Ban,
  SearchCheck,
  Loader2,
  User,
  Car,
  PackageOpen,
  ClipboardList,
  LucideIcon,
} from "lucide-react";
import type { ElectronicDocumentResource } from "../lib/electronicDocument.interface";
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

function fmtDateShort(value?: string | null) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Título de sección: sirve de ancla visual, con aire arriba. */
function Section({
  title,
  action,
  cols = 1,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  cols?: 1 | 2;
  children: React.ReactNode;
}) {
  return (
    <div className="pt-5 first:pt-1">
      <div className="mb-1 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide">{title}</p>
        {action}
      </div>
      <div
        className={
          cols === 2
            ? "grid grid-cols-1 gap-x-10 sm:grid-cols-2"
            : "flex flex-col"
        }
      >
        {children}
      </div>
    </div>
  );
}

/** Bloque destacado sobre superficie suave (sin borde). */
function BoxSection({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="pt-5 first:pt-1">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide">{title}</p>
        {action}
      </div>
      <div className="rounded-lg bg-muted/50 px-4 py-2">{children}</div>
    </div>
  );
}

/** Tarjeta suave (sin borde ni franja) para agrupar en grilla. */
function CardSection({
  title,
  icon: Icon,
  action,
  children,
}: {
  title: string;
  icon: LucideIcon;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg bg-muted/40 p-4 shadow-sm">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide">
          <Icon className="h-3.5 w-3.5" />
          {title}
        </p>
        {action}
      </div>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}

/** Fila etiqueta / valor. Se omite si el valor está vacío. */
function Field({
  label,
  value,
  copy,
  stack,
}: {
  label: string;
  value?: React.ReactNode;
  copy?: boolean;
  stack?: boolean;
}) {
  if (value === undefined || value === null || value === "" || value === "N/A")
    return null;

  const isText = typeof value === "string" || typeof value === "number";

  if (stack) {
    return (
      <div className="border-b border-border/60 py-1.5 last:border-0">
        <p className="text-[13px] text-muted-foreground">{label}</p>
        {copy && isText ? (
          <CopyCell
            value={String(value)}
            label={String(value)}
            className="text-sm font-medium"
          />
        ) : isText ? (
          <p className="wrap-break-word text-sm font-medium">{value}</p>
        ) : (
          <div className="text-sm font-medium">{value}</div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 py-1.5 last:border-0">
      <span className="shrink-0 text-[13px] text-muted-foreground">{label}</span>
      {copy && isText ? (
        <CopyCell
          value={String(value)}
          size="sm"
          className="min-w-0 truncate text-right font-medium"
        />
      ) : isText ? (
        <span className="min-w-0 truncate text-right text-sm font-medium">
          {value}
        </span>
      ) : (
        <span className="text-right text-sm font-medium tabular-nums">
          {value}
        </span>
      )}
    </div>
  );
}

/** Tira de 3 datos clave. */
function MetricStrip({
  items,
}: {
  items: { label: string; value: React.ReactNode; tone?: "success" | "danger" }[];
}) {
  return (
    <div className="flex flex-wrap gap-2 pt-4">
      {items.map((it, i) => (
        <div
          key={i}
          className="min-w-[9rem] flex-1 rounded-lg bg-muted/50 px-3 py-2"
        >
          <p className="text-[11px] text-muted-foreground">{it.label}</p>
          <p
            className={
              "text-sm font-semibold " +
              (it.tone === "success"
                ? "text-green-600"
                : it.tone === "danger"
                  ? "text-red-600"
                  : "")
            }
          >
            {it.value}
          </p>
        </div>
      ))}
    </div>
  );
}

/** Renglón de importe alineado a la derecha, estilo comprobante. */
function AmountRow({
  label,
  value,
  strong,
  big,
}: {
  label: string;
  value: React.ReactNode;
  strong?: boolean;
  big?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span
        className={strong ? "font-semibold" : "text-xs text-muted-foreground"}
      >
        {label}
      </span>
      <span
        className={
          big
            ? "whitespace-nowrap text-2xl font-bold text-primary tabular-nums"
            : strong
              ? "whitespace-nowrap font-bold tabular-nums"
              : "whitespace-nowrap text-xs font-medium text-muted-foreground tabular-nums"
        }
      >
        {value}
      </span>
    </div>
  );
}

/** Recuadro de importes (sin borde), total en grande. */
function AmountBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end pt-5">
      <div className="w-full max-w-[320px] space-y-1 rounded-lg bg-muted/50 p-4">
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
  const isComercial = doc.area_id === AREA_COMERCIAL;
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

  const vehicleOneLine = vehicle
    ? [
        vehicleTitle,
        vehicle.vin ? `VIN ${vehicle.vin}` : null,
        vehicle.plate,
      ]
        .filter(Boolean)
        .join(" · ")
    : null;

  const originLabel = isComercial ? "Comercial" : "Posventa";

  const handleQueryStatus = () => queryStatusMutation.mutate(doc.id);

  const fullNumber = doc.full_number ?? `${doc.serie}-${doc.numero}`;

  // Estado SUNAT resumido para la tira de datos clave.
  const sunatState: { text: string; tone?: "success" | "danger" } =
    doc.status === "cancelled"
      ? { text: "Anulado", tone: "danger" }
      : doc.status === "draft"
        ? { text: "Sin enviar" }
        : doc.aceptada_por_sunat === true
          ? { text: "Aceptado", tone: "success" }
          : doc.aceptada_por_sunat === false
            ? { text: "Rechazado", tone: "danger" }
            : { text: "Pendiente" };

  const hasFiscalExtras =
    doc.detraccion || !!doc.total_percepcion || !!doc.total_retencion;

  return (
    <GeneralSheet
      open={open}
      onClose={() => onOpenChange(false)}
      icon="FileText"
      title="Detalle del Comprobante Electrónico"
      subtitle={`${doc.document_type?.description ?? "Comprobante"} · ${fullNumber}`}
      size="5xl"
    >
      <div className="px-6 text-sm">
        {/* ------------------------- Hero ------------------------- */}
        <div className="pb-4">
          <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {doc.document_type?.description ?? "Comprobante"}
                {isFetching && (
                  <Loader2 className="ml-2 inline h-3 w-3 animate-spin" />
                )}
              </p>
              <CopyCell
                value={fullNumber}
                label={fullNumber}
                size="lg"
                className="text-2xl font-bold tracking-wide"
              />
              <p className="mt-0.5 truncate text-sm font-medium">
                {doc.cliente_denominacion}
              </p>
              <p className="text-xs text-muted-foreground">
                {[
                  doc.cliente_numero_de_documento,
                  doc.sede_shop,
                  doc.sede_abrev || doc.sede,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Total
              </p>
              <p className="text-3xl font-bold text-primary tabular-nums">
                {money(doc.total)}
              </p>
              <p className="text-xs text-muted-foreground">
                {[
                  doc.currency?.iso_code,
                  doc.tipo_de_cambio ? `TC ${doc.tipo_de_cambio}` : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
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
            {!isComercial && doc.consolidation_type && (
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

          <div className="mt-3 flex flex-wrap gap-2">
            {doc.enlace_del_pdf && (
              <Button variant="outline" size="sm" asChild>
                <Link
                  to={doc.enlace_del_pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="mr-2 h-4 w-4" />
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
                  <Download className="mr-2 h-4 w-4" />
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
                  <Download className="mr-2 h-4 w-4" />
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
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <SearchCheck className="mr-2 h-4 w-4" />
              )}
              Consultar a SUNAT
            </Button>
          </div>
        </div>

        <Tabs defaultValue="resumen" className="border-t border-border pt-3">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
            <TabsTrigger value="resumen">Resumen</TabsTrigger>
            <TabsTrigger value="items">Ítems ({items.length})</TabsTrigger>
            <TabsTrigger value="cliente">Cliente y vehículo</TabsTrigger>
            <TabsTrigger value="sunat">SUNAT y trazabilidad</TabsTrigger>
          </TabsList>

          {/* ------------------------- RESUMEN ------------------------- */}
          <TabsContent value="resumen">
            <MetricStrip
              items={[
                {
                  label: "Emisión",
                  value: fmtDateShort(doc.fecha_de_emision) ?? "—",
                },
                {
                  label: "Estado SUNAT",
                  value: sunatState.text,
                  tone: sunatState.tone,
                },
                {
                  label: doc.fecha_de_vencimiento ? "Vence" : "Condición",
                  value:
                    fmtDateShort(doc.fecha_de_vencimiento) ??
                    doc.condiciones_de_pago ??
                    "Contado",
                },
              ]}
            />

            {(quote || vehicle) && (
              <BoxSection title="A quién apunta">
                {isComercial && vehicle?.vin && (
                  <div className="mb-1 border-b border-border/60 py-1.5">
                    <p className="text-[13px] text-muted-foreground">VIN</p>
                    <CopyCell
                      value={vehicle.vin}
                      label={vehicle.vin}
                      size="lg"
                      className="font-bold tracking-wide"
                    />
                  </div>
                )}
                <Field label="Titular de la solicitud" value={quote?.holder} />
                <Field label="Asesor" value={quote?.advisor} />
                <Field label="Oportunidad" value={quote?.opportunity_code} />
                <Field
                  label="Cotización"
                  value={quote?.correlative || quote?.internal_code}
                  copy
                />
                <Field label="Vehículo" value={vehicleOneLine} stack />
              </BoxSection>
            )}

            <Section title="Documento" cols={2}>
              <Field
                label="Tipo de documento"
                value={doc.document_type?.description}
              />
              <Field
                label="Tipo de operación"
                value={doc.transaction_type?.description}
              />
              <Field label="Serie" value={doc.serie} copy />
              <Field
                label="Número"
                value={String(doc.numero).padStart(8, "0")}
                copy
              />
              <Field label="Módulo de origen" value={originLabel} />
              <Field label="Sede / tienda" value={doc.sede_shop} />
              <Field
                label="Fecha de emisión"
                value={fmtDate(doc.fecha_de_emision)}
              />
              <Field
                label="Fecha de vencimiento"
                value={fmtDate(doc.fecha_de_vencimiento)}
              />
              <Field
                label="Condiciones de pago"
                value={doc.condiciones_de_pago}
              />
              <Field label="Medio de pago" value={doc.medio_de_pago} />
              <Field
                label="Días de crédito"
                value={doc.credit_days ? `${doc.credit_days} días` : null}
              />
              <Field
                label="Tipo de financiamiento"
                value={doc.financing_type}
              />
              <Field label="N° de operación" value={doc.operation_number} />
              <Field label="Banco / chequera" value={doc.bank?.code} />
              <Field label="Tarjeta (últimos 4)" value={doc.card_last4} />
              <Field
                label="Contingencia"
                value={doc.generado_por_contingencia ? "Sí" : null}
              />
              <Field
                label="Envío automático a SUNAT"
                value={doc.enviar_automaticamente_a_la_sunat ? "Sí" : "No"}
              />
              <Field
                label="Envío automático al cliente"
                value={doc.enviar_automaticamente_al_cliente ? "Sí" : "No"}
              />
            </Section>

            {(doc.related_document_number ||
              doc.order_quotation?.number ||
              doc.work_order?.number ||
              doc.credit_note_number ||
              doc.debit_note_number) && (
              <Section title="Referencias" cols={2}>
                <Field
                  label={doc.related_document_type || "Documento relacionado"}
                  value={doc.related_document_number}
                />
                <Field
                  label="Cotización posventa"
                  value={doc.order_quotation?.number}
                />
                <Field
                  label="Orden de trabajo"
                  value={doc.work_order?.number}
                />
                <Field label="Nota de crédito" value={doc.credit_note_number} />
                <Field label="Nota de débito" value={doc.debit_note_number} />
              </Section>
            )}

            {hasFiscalExtras && (
              <Section title="Detracción / percepción / retención" cols={2}>
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
                      label="Monto detracción"
                      value={money(doc.detraccion_total)}
                    />
                  </>
                )}
                {!!doc.total_percepcion && (
                  <>
                    <Field
                      label="Base percepción"
                      value={money(doc.percepcion_base_imponible)}
                    />
                    <Field
                      label="Total percepción"
                      value={money(doc.total_percepcion)}
                    />
                  </>
                )}
                {!!doc.total_retencion && (
                  <>
                    <Field
                      label="Base retención"
                      value={money(doc.retencion_base_imponible)}
                    />
                    <Field
                      label="Total retención"
                      value={money(doc.total_retencion)}
                    />
                  </>
                )}
              </Section>
            )}

            <AmountBox>
              {!!doc.total_gravada && (
                <AmountRow
                  label="Op. gravada"
                  value={money(doc.total_gravada)}
                />
              )}
              {!!doc.total_exonerada && (
                <AmountRow
                  label="Op. exonerada"
                  value={money(doc.total_exonerada)}
                />
              )}
              {!!doc.total_inafecta && (
                <AmountRow
                  label="Op. inafecta"
                  value={money(doc.total_inafecta)}
                />
              )}
              {!!doc.total_gratuita && (
                <AmountRow
                  label="Op. gratuita"
                  value={money(doc.total_gratuita)}
                />
              )}
              {!!doc.total_descuento && (
                <AmountRow
                  label="Descuento"
                  value={money(doc.total_descuento)}
                />
              )}
              {!!doc.total_anticipo && (
                <AmountRow
                  label="Anticipos"
                  value={money(doc.total_anticipo)}
                />
              )}
              {!!doc.total_otros_cargos && (
                <AmountRow
                  label="Otros cargos"
                  value={money(doc.total_otros_cargos)}
                />
              )}
              {!!doc.total_isc && (
                <AmountRow label="ISC" value={money(doc.total_isc)} />
              )}
              <AmountRow
                label={`IGV (${doc.porcentaje_de_igv}%)`}
                value={money(doc.total_igv)}
              />
              <Separator className="my-1.5" />
              <AmountRow label="Total" value={money(doc.total)} strong big />
            </AmountBox>
          </TabsContent>

          {/* ------------------------- ÍTEMS ------------------------- */}
          <TabsContent value="items">
            <div className="pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="h-9 pl-0">Descripción</TableHead>
                    <TableHead className="h-9 px-2 text-right">Cant.</TableHead>
                    <TableHead className="h-9 px-2 text-right">
                      V. Unit.
                    </TableHead>
                    <TableHead className="h-9 px-2 text-right">
                      P. Unit.
                    </TableHead>
                    <TableHead className="h-9 px-2 text-right">Dscto.</TableHead>
                    <TableHead className="h-9 px-2 text-right">IGV</TableHead>
                    <TableHead className="h-9 pr-0 text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="py-6 text-center text-muted-foreground"
                      >
                        El comprobante no tiene ítems registrados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item, i) => {
                      const igvLabel =
                        item.igv_type?.description ?? item.igvType?.description;
                      return (
                        <TableRow key={i}>
                          <TableCell className="py-2 pl-0 align-top">
                            <p className="whitespace-pre-line font-medium">
                              {item.descripcion}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.unidad_de_medida}
                              {igvLabel ? ` · ${igvLabel}` : ""}
                            </p>
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
                              <p className="text-xs text-muted-foreground">
                                SUNAT: {item.codigo_producto_sunat}
                              </p>
                            )}
                            {!!item.anticipo_regularizacion &&
                              !!item.anticipo_documento_serie && (
                                <p className="text-xs text-blue-600">
                                  Regulariza anticipo{" "}
                                  {item.anticipo_documento_serie}-
                                  {item.anticipo_documento_numero}
                                </p>
                              )}
                          </TableCell>
                          <TableCell className="whitespace-nowrap px-2 py-2 text-right align-top">
                            {item.cantidad}
                          </TableCell>
                          <TableCell className="whitespace-nowrap px-2 py-2 text-right align-top">
                            {money(item.valor_unitario)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap px-2 py-2 text-right align-top">
                            {money(item.precio_unitario)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap px-2 py-2 text-right align-top">
                            {item.descuento ? money(item.descuento) : "—"}
                          </TableCell>
                          <TableCell className="whitespace-nowrap px-2 py-2 text-right align-top">
                            {money(item.igv)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap py-2 pr-0 text-right align-top font-semibold">
                            {money(item.total)}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            <AmountBox>
              {!!doc.total_descuento && (
                <AmountRow
                  label="Descuento"
                  value={money(doc.total_descuento)}
                />
              )}
              {!!doc.total_gravada && (
                <AmountRow
                  label="Op. gravada"
                  value={money(doc.total_gravada)}
                />
              )}
              {!!doc.total_exonerada && (
                <AmountRow
                  label="Op. exonerada"
                  value={money(doc.total_exonerada)}
                />
              )}
              {!!doc.total_inafecta && (
                <AmountRow
                  label="Op. inafecta"
                  value={money(doc.total_inafecta)}
                />
              )}
              {!!doc.total_anticipo && (
                <AmountRow label="Anticipos" value={money(doc.total_anticipo)} />
              )}
              {!!doc.total_otros_cargos && (
                <AmountRow
                  label="Otros cargos"
                  value={money(doc.total_otros_cargos)}
                />
              )}
              <AmountRow
                label={`IGV (${doc.porcentaje_de_igv}%)`}
                value={money(doc.total_igv)}
              />
              <Separator className="my-1.5" />
              <AmountRow label="Total" value={money(doc.total)} strong big />
            </AmountBox>

            {installments.length > 0 && (
              <div className="pt-5">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide">
                  Cuotas ({installments.length})
                </p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="h-9 pl-0">Cuota</TableHead>
                      <TableHead className="h-9 px-2">Fecha de pago</TableHead>
                      <TableHead className="h-9 pr-0 text-right">
                        Importe
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {installments.map((r, i) => (
                      <TableRow key={i}>
                        <TableCell className="py-2 pl-0">{r.cuota}</TableCell>
                        <TableCell className="whitespace-nowrap px-2 py-2">
                          {fmtDate(r.fecha_de_pago)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap py-2 pr-0 text-right font-medium">
                          {money(r.importe)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {guides.length > 0 && (
              <Section title="Guías de remisión">
                {guides.map((g) => (
                  <Field
                    key={g.id ?? g.guia_serie_numero}
                    label={g.guia_tipo_descripcion || `Tipo ${g.guia_tipo}`}
                    value={g.guia_serie_numero}
                    copy
                  />
                ))}
              </Section>
            )}
          </TabsContent>

          {/* ------------------- CLIENTE Y VEHÍCULO ------------------- */}
          <TabsContent value="cliente">
            <div className="grid items-start gap-3 pt-4 md:grid-cols-2">
              <CardSection title="Cliente" icon={User}>
                <Field
                  label="Razón social / nombre"
                  value={doc.cliente_denominacion}
                  stack
                />
                <Field
                  label={doc.identity_document_type?.description || "Documento"}
                  value={doc.cliente_numero_de_documento}
                  copy
                />
                <Field label="Email" value={doc.cliente_email} copy />
                <Field label="Email adicional 1" value={doc.cliente_email_1} />
                <Field label="Email adicional 2" value={doc.cliente_email_2} />
                <Field label="Dirección" value={doc.cliente_direccion} stack />
              </CardSection>

              <CardSection
                title="Vehículo"
                icon={Car}
                action={
                  vehicle?.status ? (
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
                {vehicle ? (
                  <>
                    <Field label="Descripción" value={vehicleTitle} stack />
                    <Field label="VIN" value={vehicle.vin} copy />
                    <Field label="Placa" value={vehicle.plate} copy />
                    <Field
                      label="N° motor"
                      value={vehicle.engine_number}
                      copy
                    />
                    <Field label="Código modelo" value={vehicle.model_code} />
                    <Field label="Versión" value={vehicle.model_version} />
                    <Field label="Color" value={vehicle.color} />
                    <Field label="Tipo de motor" value={vehicle.engine_type} />
                    <Field label="Año" value={vehicle.year} />
                    <Field label="Kilometraje" value={vehicle.mileage} />
                    <Field label="Almacén físico" value={vehicle.warehouse} />
                  </>
                ) : (
                  <p className="py-1 text-sm text-muted-foreground">
                    Sin vehículo asociado.
                  </p>
                )}
              </CardSection>

              {doc.vehicle_movement && (
                <CardSection
                  title="Movimiento de inventario"
                  icon={PackageOpen}
                >
                  <Field
                    label="Fecha"
                    value={fmtDate(doc.vehicle_movement.date)}
                  />
                  <Field label="Estado" value={doc.vehicle_movement.status} />
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
                    stack
                  />
                </CardSection>
              )}

              {quote && (
                <CardSection title="Cotización de origen" icon={ClipboardList}>
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
                  <Field
                    label="Precio de venta"
                    value={money(quote.sale_price)}
                  />
                  <Field label="A cuenta" value={money(quote.down_payment)} />
                </CardSection>
              )}
            </div>
          </TabsContent>

          {/* ------------------- SUNAT Y TRAZABILIDAD ------------------- */}
          <TabsContent value="sunat">
            <div className="pt-4">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide">
                Estado SUNAT
              </p>
              <div className="flex items-center gap-2">
                {doc.aceptada_por_sunat === true && doc.status !== "draft" ? (
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
              <div className="mt-1.5 grid grid-cols-1 gap-x-10 sm:grid-cols-2">
                <Field
                  label="Código de respuesta"
                  value={doc.sunat_responsecode}
                />
                <Field label="Descripción" value={doc.sunat_description} />
                <Field label="Nota SUNAT" value={doc.sunat_note} />
                <Field
                  label="Anulado en SUNAT"
                  value={
                    doc.anulado
                      ? "Sí"
                      : doc.status === "cancelled"
                        ? "Anulación en proceso"
                        : "No"
                  }
                />
                <Field
                  label="Anulado en Dynamics"
                  value={doc.is_annulled ? "Sí" : "No"}
                />
                {doc.was_dyn_requested && (
                  <Field
                    label="Solicitud de anulación a Dynamics"
                    value="Enviada"
                  />
                )}
                <Field label="Error SOAP" value={doc.sunat_soap_error} stack />
                <Field
                  label="Mensaje de error"
                  value={doc.error_message}
                  stack
                />
              </div>
            </div>

            <Section title="Identificadores">
              <Field label="Código único" value={doc.codigo_unico} copy />
              <Field label="Hash" value={doc.codigo_hash} copy />
              <Field
                label="Enlace público"
                stack
                value={
                  doc.enlace ? (
                    <a
                      href={doc.enlace}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-sm font-medium text-primary underline"
                    >
                      {doc.enlace}
                    </a>
                  ) : null
                }
              />
              <Field
                label="Cadena para código QR"
                stack
                value={
                  doc.cadena_para_codigo_qr ? (
                    <p className="break-all font-mono text-xs">
                      {doc.cadena_para_codigo_qr}
                    </p>
                  ) : null
                }
              />
            </Section>

            {(doc.documento_que_se_modifica_serie ||
              doc.original_document ||
              doc.credit_note_number ||
              doc.debit_note_number) && (
              <Section title="Documentos vinculados" cols={2}>
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
                  label="Nota de crédito"
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
                  label="Nota de débito"
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
              </Section>
            )}

            <Section title="Auditoría" cols={2}>
              <Field label="Creado por" value={doc.creator_name} />
              <Field label="Actualizado por" value={doc.updater_name} />
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
            </Section>

            {doc.observaciones && (
              <div className="pt-5">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide">
                  Observaciones
                </p>
                <p className="whitespace-pre-wrap wrap-break-word text-sm text-muted-foreground">
                  {doc.observaciones}
                </p>
              </div>
            )}

            {doc.internal_note && (
              <div className="pt-5">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide">
                  Comentario interno
                </p>
                <p className="whitespace-pre-wrap wrap-break-word text-sm text-muted-foreground">
                  {doc.internal_note}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </GeneralSheet>
  );
}
