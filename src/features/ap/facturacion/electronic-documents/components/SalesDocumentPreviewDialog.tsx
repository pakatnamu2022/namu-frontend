import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, FileSearch, AlertTriangle } from "lucide-react";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { ButtonAction } from "@/shared/components/ButtonAction";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  previewNubefactElectronicDocument,
  previewDynamicsPayloadElectronicDocument,
} from "../lib/electronicDocument.actions";
import type {
  NubefactPreviewResource,
  DynamicsPayloadPreviewResource,
  DynamicsPayloadDetail,
} from "../lib/electronicDocument.interface";
import {
  getNubefactDocumentTypeLabel,
  getNubefactDetractionTypeLabel,
  getNubefactCurrencyLabel,
} from "../lib/electronicDocument.constants";

interface NubefactPreviewDialogProps {
  documentId: number;
}

type PreviewMode = "nubefact" | "dynamics";

const CURRENCY_SYMBOLS: Record<string, string> = {
  "1": "S/",
  "2": "$",
  "3": "€",
  "4": "£",
  SOLES: "S/",
  PEN: "S/",
  DOLARES: "$",
  USD: "$",
};

function formatMoney(value: string | number | undefined, symbol: string) {
  const num = Number(value ?? 0);
  return `${symbol} ${num.toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value?: string) {
  if (!value) return "-";

  // Nubefact envía algunas fechas como DD-MM-YYYY (ej. cuotas de crédito)
  const ddmmyyyy = value.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    return `${day}/${month}/${year}`;
  }

  const parsed = new Date(value);
  if (isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function groupDynamicsDetailsByWorkOrder(
  details: DynamicsPayloadDetail[],
): Record<string, DynamicsPayloadDetail[]> {
  return details.reduce<Record<string, DynamicsPayloadDetail[]>>(
    (acc, detail) => {
      const key = String(detail.work_order_id);
      (acc[key] ??= []).push(detail);
      return acc;
    },
    {},
  );
}

function DynamicsField({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="flex justify-between gap-2 border-b border-dashed border-muted-foreground/20 pb-1 last:border-b-0">
      <dt className="shrink-0 font-mono text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">
        {value === "" || value === null || value === undefined ? "-" : value}
      </dd>
    </div>
  );
}

export default function SalesDocumentPreviewDialog({
  documentId,
}: NubefactPreviewDialogProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<PreviewMode>("nubefact");

  const { data, isFetching, isError, error } =
    useQuery<NubefactPreviewResource>({
      queryKey: ["electronicDocumentNubefactPreview", documentId],
      queryFn: () => previewNubefactElectronicDocument(documentId),
      enabled: open && mode === "nubefact",
      retry: false,
    });

  const {
    data: dynamicsData,
    isFetching: isFetchingDynamics,
    isError: isErrorDynamics,
    error: dynamicsError,
  } = useQuery<DynamicsPayloadPreviewResource>({
    queryKey: ["electronicDocumentDynamicsPayloadPreview", documentId],
    queryFn: () => previewDynamicsPayloadElectronicDocument(documentId),
    enabled: open && mode === "dynamics",
    retry: false,
  });

  const symbol = data ? CURRENCY_SYMBOLS[data.moneda] || "" : "";
  const errorMessage =
    (error as any)?.response?.data?.message ||
    "No se pudo obtener la previsualización del comprobante.";
  const dynamicsErrorMessage =
    (dynamicsError as any)?.response?.data?.message ||
    "No se pudo obtener el payload de Dynamics.";

  return (
    <>
      <ButtonAction
        tooltip="Previsualizar comprobante"
        icon={FileSearch}
        color="blue"
        onClick={() => setOpen(true)}
      />

      <GeneralSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Previsualización de Comprobante"
        subtitle={
          data
            ? `${getNubefactDocumentTypeLabel(data.tipo_de_comprobante)} ${data.serie}-${data.numero}`
            : `Documento #${documentId}`
        }
        icon="FileSearch"
        size="4xl"
      >
        <Tabs
          value={mode}
          onValueChange={(value) => setMode(value as PreviewMode)}
          className="w-full"
        >
          <TabsList>
            <TabsTrigger value="nubefact">
              Previsualización Nubefact
            </TabsTrigger>
            <TabsTrigger value="dynamics">Payload Dynamics</TabsTrigger>
          </TabsList>

          <TabsContent value="nubefact">
            {isFetching && (
              <div className="flex h-96 items-center justify-center">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
              </div>
            )}

            {!isFetching && isError && (
              <div className="flex h-96 flex-col items-center justify-center gap-2 text-center">
                <AlertTriangle className="size-8 text-rose-500" />
                <p className="text-sm font-medium text-rose-600">
                  {errorMessage}
                </p>
              </div>
            )}

            {!isFetching && data && (
              <div className="flex min-h-full w-full justify-center bg-muted/40 py-6 print:bg-white print:py-0">
                <div className="w-full max-w-sm bg-background px-5 py-6 font-mono text-foreground shadow-lg print:shadow-none print:text-slate-900">
                  {/* Encabezado */}
                  <div className="flex flex-col items-center gap-1.5 text-center">
                    <img
                      src="/images/logo-ap.png"
                      alt="Automotores Pakatnamu"
                      className="h-8 w-auto object-contain"
                    />
                    <p className="text-[10px] leading-tight text-muted-foreground">
                      CAR. PANAMERICANA NORTE NRO. 1006 (COSTAD COLEG. SANTO
                      TORIBIO-CURVA...)
                    </p>
                    <p className="text-[10px] leading-tight text-muted-foreground">
                      CHICLAYO - CHICLAYO - LAMBAYEQUE
                    </p>
                    <p className="text-[10px] font-medium text-muted-foreground">
                      RUC 20538993400
                    </p>
                  </div>

                  <div className="my-3 border-t border-dashed border-muted-foreground/40" />

                  <div className="text-center">
                    <p className="text-xs font-semibold uppercase leading-tight">
                      {getNubefactDocumentTypeLabel(data.tipo_de_comprobante)}
                    </p>
                    <p className="text-sm font-bold tracking-wide">
                      {data.serie}-{data.numero}
                    </p>
                  </div>

                  <div className="my-3 border-t border-dashed border-muted-foreground/40" />

                  {/* Datos cliente / documento */}
                  <dl className="space-y-1 text-[11px] leading-tight">
                    <div className="flex justify-between gap-2">
                      <dt className="shrink-0 text-muted-foreground">
                        {data.cliente_tipo_de_documento === "6"
                          ? "RUC"
                          : "DOC."}
                      </dt>
                      <dd className="text-right font-medium">
                        {data.cliente_numero_de_documento}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="shrink-0 text-muted-foreground">
                        CLIENTE
                      </dt>
                      <dd className="text-right font-medium">
                        {data.cliente_denominacion}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="shrink-0 text-muted-foreground">
                        DIRECCIÓN
                      </dt>
                      <dd className="text-right font-medium">
                        {data.cliente_direccion}
                      </dd>
                    </div>
                    {!!data.cliente_email && (
                      <div className="flex justify-between gap-2">
                        <dt className="shrink-0 text-muted-foreground">
                          EMAIL
                        </dt>
                        <dd className="text-right font-medium">
                          {data.cliente_email}
                        </dd>
                      </div>
                    )}
                    <div className="flex justify-between gap-2">
                      <dt className="shrink-0 text-muted-foreground">
                        EMISIÓN
                      </dt>
                      <dd className="text-right font-medium">
                        {formatDate(data.fecha_de_emision)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="shrink-0 text-muted-foreground">VENC.</dt>
                      <dd className="text-right font-medium">
                        {formatDate(data.fecha_de_vencimiento)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="shrink-0 text-muted-foreground">MONEDA</dt>
                      <dd className="text-right font-medium">
                        {getNubefactCurrencyLabel(data.moneda)}
                      </dd>
                    </div>
                    {!!data.tipo_de_cambio &&
                      Number(data.tipo_de_cambio) > 0 && (
                        <div className="flex justify-between gap-2">
                          <dt className="shrink-0 text-muted-foreground">
                            T. CAMBIO
                          </dt>
                          <dd className="text-right font-medium">
                            {data.tipo_de_cambio}
                          </dd>
                        </div>
                      )}
                    {!!data.condiciones_de_pago && (
                      <div className="flex justify-between gap-2">
                        <dt className="shrink-0 text-muted-foreground">
                          CONDICIÓN
                        </dt>
                        <dd className="text-right font-medium">
                          {data.condiciones_de_pago}
                        </dd>
                      </div>
                    )}
                  </dl>

                  <div className="my-3 border-t border-dashed border-muted-foreground/40" />

                  {/* Items */}
                  <div className="space-y-2.5 text-[11px]">
                    {data.items.map((item, index) => (
                      <div key={index}>
                        <p className="font-medium uppercase leading-tight">
                          {item.descripcion}
                        </p>
                        <div className="flex justify-between text-muted-foreground">
                          <span>
                            {item.cantidad} {item.unidad_de_medida} x{" "}
                            {Number(item.precio_unitario).toLocaleString(
                              "es-PE",
                              {
                                minimumFractionDigits: 2,
                              },
                            )}
                            {!!item.codigo && ` · ${item.codigo}`}
                          </span>
                          <span className="font-semibold text-foreground">
                            {formatMoney(item.total, symbol)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cuotas de crédito */}
                  {data.venta_al_credito?.length > 0 && (
                    <>
                      <div className="my-3 border-t border-dashed border-muted-foreground/40" />
                      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Venta al Crédito
                      </p>
                      <div className="space-y-1 text-[11px]">
                        {data.venta_al_credito.map((cuota, index) => (
                          <div key={index} className="flex justify-between">
                            <span className="text-muted-foreground">
                              CUOTA {cuota.cuota} ·{" "}
                              {formatDate(String(cuota.fecha_de_pago))}
                            </span>
                            <span className="font-medium">
                              {formatMoney(cuota.importe, symbol)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  <div className="my-3 border-t border-dashed border-muted-foreground/40" />

                  {/* Totales */}
                  <dl className="space-y-1 text-[11px]">
                    {Number(data.total_anticipo) > 0 && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">ANTICIPO</dt>
                        <dd className="font-medium">
                          -{formatMoney(data.total_anticipo, symbol)}
                        </dd>
                      </div>
                    )}
                    {Number(data.total_gravada) > 0 && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">GRAVADA</dt>
                        <dd className="font-medium">
                          {formatMoney(data.total_gravada, symbol)}
                        </dd>
                      </div>
                    )}
                    {Number(data.total_inafecta) > 0 && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">INAFECTA</dt>
                        <dd className="font-medium">
                          {formatMoney(data.total_inafecta, symbol)}
                        </dd>
                      </div>
                    )}
                    {Number(data.total_exonerada) > 0 && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">EXONERADA</dt>
                        <dd className="font-medium">
                          {formatMoney(data.total_exonerada, symbol)}
                        </dd>
                      </div>
                    )}
                    {Number(data.total_gratuita) > 0 && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">GRATUITA</dt>
                        <dd className="font-medium">
                          {formatMoney(data.total_gratuita, symbol)}
                        </dd>
                      </div>
                    )}
                    {Number(data.total_isc) > 0 && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">ISC</dt>
                        <dd className="font-medium">
                          {formatMoney(data.total_isc, symbol)}
                        </dd>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">
                        IGV {Number(data.porcentaje_de_igv).toFixed(2)}%
                      </dt>
                      <dd className="font-medium">
                        {formatMoney(data.total_igv, symbol)}
                      </dd>
                    </div>
                    {Number(data.total_otros_cargos) > 0 && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">OTROS CARGOS</dt>
                        <dd className="font-medium">
                          {formatMoney(data.total_otros_cargos, symbol)}
                        </dd>
                      </div>
                    )}
                    {Number(data.descuento_global) > 0 && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">
                          DESCUENTO GLOBAL
                        </dt>
                        <dd className="font-medium">
                          -{formatMoney(data.descuento_global, symbol)}
                        </dd>
                      </div>
                    )}
                    {Number(data.total_descuento) > 0 && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">DESCUENTO</dt>
                        <dd className="font-medium">
                          -{formatMoney(data.total_descuento, symbol)}
                        </dd>
                      </div>
                    )}
                    {Number(data.total_percepcion) > 0 && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">
                          PERCEPCIÓN{" "}
                          {data.percepcion_tipo
                            ? `(${data.percepcion_tipo})`
                            : ""}
                        </dt>
                        <dd className="font-medium">
                          {formatMoney(data.total_percepcion, symbol)}
                        </dd>
                      </div>
                    )}
                    {Number(data.total_retencion) > 0 && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">RETENCIÓN</dt>
                        <dd className="font-medium">
                          -{formatMoney(data.total_retencion, symbol)}
                        </dd>
                      </div>
                    )}
                  </dl>

                  <div className="my-3 border-t border-dashed border-muted-foreground/40" />

                  <div className="flex justify-between text-base font-bold">
                    <span>TOTAL</span>
                    <span>{formatMoney(data.total, symbol)}</span>
                  </div>

                  {data.detraccion && (
                    <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
                      <span>
                        DETRACCIÓN{" "}
                        {Number(data.detraccion_porcentaje).toFixed(2)}%
                      </span>
                      <span className="font-medium">
                        {formatMoney(data.detraccion_total, "S/")}
                      </span>
                    </div>
                  )}

                  {/* Observaciones / condiciones */}
                  {(!!data.observaciones ||
                    !!data.medio_de_pago ||
                    data.detraccion ||
                    !!data.placa_vehiculo ||
                    !!data.orden_compra_servicio) && (
                    <>
                      <div className="my-3 border-t border-dashed border-muted-foreground/40" />
                      <div className="space-y-1 text-[10px] leading-relaxed text-muted-foreground">
                        {!!data.observaciones && (
                          <p>
                            <span className="font-semibold text-foreground">
                              Obs:{" "}
                            </span>
                            {data.observaciones}
                          </p>
                        )}
                        {!!data.medio_de_pago && (
                          <p>
                            <span className="font-semibold text-foreground">
                              Forma de Pago:{" "}
                            </span>
                            {data.medio_de_pago}
                          </p>
                        )}
                        {data.detraccion && (
                          <>
                            {!!data.medio_de_pago_detraccion && (
                              <p>
                                <span className="font-semibold text-foreground">
                                  Operación sujeta al SPOT.
                                </span>{" "}
                                {data.medio_de_pago_detraccion}
                              </p>
                            )}
                            {!!data.detraccion_tipo && (
                              <p>
                                <span className="font-semibold text-foreground">
                                  Tipo de Detracción:{" "}
                                </span>
                                {getNubefactDetractionTypeLabel(
                                  data.detraccion_tipo,
                                )}
                              </p>
                            )}
                          </>
                        )}
                        {!!data.placa_vehiculo && (
                          <p>
                            <span className="font-semibold text-foreground">
                              Placa:{" "}
                            </span>
                            {data.placa_vehiculo}
                          </p>
                        )}
                        {!!data.orden_compra_servicio && (
                          <p>
                            <span className="font-semibold text-foreground">
                              O/C:{" "}
                            </span>
                            {data.orden_compra_servicio}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  <div className="my-3 border-t border-dashed border-muted-foreground/40" />

                  {/* Nota informativa */}
                  <p className="text-center text-[9px] leading-snug text-muted-foreground">
                    Esta es una previsualización de los datos que se enviarán a
                    Nubefact / SUNAT. El comprobante aún no ha sido emitido.
                  </p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="dynamics">
            {isFetchingDynamics && (
              <div className="flex h-96 items-center justify-center">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
              </div>
            )}

            {!isFetchingDynamics && isErrorDynamics && (
              <div className="flex h-96 flex-col items-center justify-center gap-2 text-center">
                <AlertTriangle className="size-8 text-rose-500" />
                <p className="text-sm font-medium text-rose-600">
                  {dynamicsErrorMessage}
                </p>
              </div>
            )}

            {!isFetchingDynamics && !isErrorDynamics && dynamicsData && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 rounded-md border bg-muted/30 p-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-muted-foreground">Documento</p>
                    <p className="font-semibold">
                      {dynamicsData.document_info.full_number}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">
                      Tipo de consolidación
                    </p>
                    <p className="font-semibold">
                      {dynamicsData.document_info.consolidation_type ?? "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Notas internas</p>
                    <p className="font-semibold">
                      {dynamicsData.document_info.internal_notes_count}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">
                      Ítems / Órdenes de trabajo
                    </p>
                    <p className="font-semibold">
                      {dynamicsData.summary.total_items} /{" "}
                      {dynamicsData.summary.total_work_orders}
                    </p>
                  </div>
                </div>

                <div className="rounded-md border">
                  <div className="border-b bg-muted/30 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Cliente ·{" "}
                    <span className="font-mono normal-case">
                      {dynamicsData.preview.client.table}
                    </span>{" "}
                    {dynamicsData.preview.client.will_sync
                      ? "(se sincronizará)"
                      : "(ya existe)"}
                  </div>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-1.5 p-3 text-xs sm:grid-cols-2 lg:grid-cols-3">
                    <DynamicsField
                      label="Número de doc."
                      value={dynamicsData.preview.client.data.num_doc}
                    />
                    <DynamicsField
                      label="Razón social / Nombre"
                      value={dynamicsData.preview.client.data.full_name}
                    />
                    <DynamicsField
                      label="ID cliente"
                      value={dynamicsData.preview.client.data.id}
                    />
                    <DynamicsField
                      label="Tipo de documento"
                      value={dynamicsData.preview.client.data.document_type_id}
                    />
                    <DynamicsField
                      label="Tipo de persona"
                      value={dynamicsData.preview.client.data.type_person_id}
                    />
                    <DynamicsField
                      label="Clase de impuesto"
                      value={dynamicsData.preview.client.data.tax_class_type_id}
                    />
                  </dl>
                </div>

                <div className="rounded-md border">
                  <div className="border-b bg-muted/30 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Cabecera ·{" "}
                    <span className="font-mono normal-case">
                      {dynamicsData.preview.header.table}
                    </span>
                  </div>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-1.5 p-3 text-xs sm:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(dynamicsData.preview.header.data).map(
                      ([key, value]) => (
                        <DynamicsField key={key} label={key} value={value} />
                      ),
                    )}
                  </dl>
                </div>

                <div className="space-y-3">
                  {Object.entries(
                    groupDynamicsDetailsByWorkOrder(
                      dynamicsData.preview.details,
                    ),
                  ).map(([workOrderId, details]) => (
                    <div key={workOrderId} className="rounded-md border">
                      <div className="border-b bg-muted/30 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Orden de Trabajo #{workOrderId} · {details.length} ítem
                        {details.length === 1 ? "" : "s"}
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b bg-muted/10 text-left text-muted-foreground">
                              <th className="px-3 py-1.5 font-medium">Línea</th>
                              <th className="px-3 py-1.5 font-medium">Tipo</th>
                              <th className="px-3 py-1.5 font-medium">
                                Artículo
                              </th>
                              <th className="px-3 py-1.5 font-medium">
                                Descripción
                              </th>
                              <th className="px-3 py-1.5 font-medium">Sitio</th>
                              <th className="px-3 py-1.5 text-right font-medium">
                                Cant.
                              </th>
                              <th className="px-3 py-1.5 font-medium">UM</th>
                              <th className="px-3 py-1.5 text-right font-medium">
                                P. Unit.
                              </th>
                              <th className="px-3 py-1.5 text-right font-medium">
                                Total
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {details.map((detail) => (
                              <tr
                                key={`${detail.data.DocumentoId}-${detail.data.Linea}`}
                                className="border-b last:border-b-0"
                              >
                                <td className="px-3 py-1.5">
                                  {detail.data.Linea}
                                </td>
                                <td className="px-3 py-1.5">
                                  {detail.type === "part"
                                    ? "Repuesto"
                                    : "Mano de obra"}
                                </td>
                                <td className="px-3 py-1.5 font-mono">
                                  {detail.data.ArticuloId}
                                </td>
                                <td className="px-3 py-1.5">
                                  {detail.data.ArticuloDescripcionCorta}
                                </td>
                                <td className="px-3 py-1.5 font-mono">
                                  {detail.data.SitioId}
                                </td>
                                <td className="px-3 py-1.5 text-right">
                                  {detail.data.Cantidad}
                                </td>
                                <td className="px-3 py-1.5">
                                  {detail.data.UnidadMedidaId}
                                </td>
                                <td className="px-3 py-1.5 text-right">
                                  {detail.data.PrecioUnitario.toFixed(2)}
                                </td>
                                <td className="px-3 py-1.5 text-right font-semibold">
                                  {detail.data.PrecioTotal.toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>

                <details className="rounded-md border">
                  <summary className="cursor-pointer select-none bg-muted/30 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Ver JSON completo
                  </summary>
                  <div className="max-h-[50vh] overflow-auto p-3">
                    <pre className="whitespace-pre-wrap break-all text-xs text-foreground">
                      {JSON.stringify(dynamicsData, null, 2)}
                    </pre>
                  </div>
                </details>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </GeneralSheet>
    </>
  );
}
