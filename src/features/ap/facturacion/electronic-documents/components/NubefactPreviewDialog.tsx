import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, FileSearch, AlertTriangle } from "lucide-react";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { ButtonAction } from "@/shared/components/ButtonAction";
import { previewNubefactElectronicDocument } from "../lib/electronicDocument.actions";
import type { NubefactPreviewResource } from "../lib/electronicDocument.interface";
import {
  getNubefactDocumentTypeLabel,
  getNubefactDetractionTypeLabel,
  getNubefactCurrencyLabel,
} from "../lib/electronicDocument.constants";

interface NubefactPreviewDialogProps {
  documentId: number;
}

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

export default function NubefactPreviewDialog({
  documentId,
}: NubefactPreviewDialogProps) {
  const [open, setOpen] = useState(false);

  const { data, isFetching, isError, error } =
    useQuery<NubefactPreviewResource>({
      queryKey: ["electronicDocumentNubefactPreview", documentId],
      queryFn: () => previewNubefactElectronicDocument(documentId),
      enabled: open,
      retry: false,
    });

  const symbol = data ? CURRENCY_SYMBOLS[data.moneda] || "" : "";
  const errorMessage =
    (error as any)?.response?.data?.message ||
    "No se pudo obtener la previsualización del comprobante.";

  return (
    <>
      <ButtonAction
        tooltip="Previsualizar comprobante Nubefact"
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
        {isFetching && (
          <div className="flex h-96 items-center justify-center">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isFetching && isError && (
          <div className="flex h-96 flex-col items-center justify-center gap-2 text-center">
            <AlertTriangle className="size-8 text-rose-500" />
            <p className="text-sm font-medium text-rose-600">{errorMessage}</p>
          </div>
        )}

        {!isFetching && data && (
          <div className="mx-auto max-w-3xl rounded-lg border bg-white p-6 text-slate-900 shadow-sm print:shadow-none">
            {/* Encabezado */}
            <div className="flex items-start justify-between gap-4 border-b pb-4">
              <div className="flex items-start gap-3">
                <img
                  src="/images/logo-ap.png"
                  alt="Automotores Pakatnamu"
                  className="h-14 w-auto shrink-0 object-contain"
                />
                <div className="flex flex-col gap-0.5 pt-1">
                  <span className="text-xs text-slate-600">
                    CAR. PANAMERICANA NORTE NRO. 1006 (COSTAD COLEG. SANTO
                    TORIBIO-CURVA...)
                  </span>
                  <span className="text-xs text-slate-600">
                    CHICLAYO - CHICLAYO - LAMBAYEQUE
                  </span>
                </div>
              </div>
              <div className="shrink-0 rounded-md bg-slate-100 px-4 py-3 text-center">
                <p className="text-xs font-medium text-slate-600">
                  RUC 20538993400
                </p>
                <p className="text-sm font-bold uppercase leading-tight">
                  {getNubefactDocumentTypeLabel(data.tipo_de_comprobante)}
                </p>
                <p className="text-sm font-bold">
                  {data.serie}-{data.numero}
                </p>
              </div>
            </div>

            {/* Datos cliente / documento */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-md border p-3">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Datos del Cliente
                </p>
                <dl className="space-y-0.5 text-xs">
                  <div className="flex gap-2">
                    <dt className="w-20 shrink-0 text-slate-500">
                      {data.cliente_tipo_de_documento === "6" ? "RUC" : "DOC."}
                    </dt>
                    <dd className="font-medium">
                      {data.cliente_numero_de_documento}
                    </dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-20 shrink-0 text-slate-500">
                      Denominación
                    </dt>
                    <dd className="font-medium">{data.cliente_denominacion}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-20 shrink-0 text-slate-500">Dirección</dt>
                    <dd className="font-medium">{data.cliente_direccion}</dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-md border p-3">
                <dl className="space-y-0.5 text-xs">
                  <div className="flex gap-2">
                    <dt className="w-28 shrink-0 text-slate-500">
                      Fecha Emisión
                    </dt>
                    <dd className="font-medium">
                      {formatDate(data.fecha_de_emision)}
                    </dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-28 shrink-0 text-slate-500">
                      Fecha Venc.
                    </dt>
                    <dd className="font-medium">
                      {formatDate(data.fecha_de_vencimiento)}
                    </dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-28 shrink-0 text-slate-500">Moneda</dt>
                    <dd className="font-medium">
                      {getNubefactCurrencyLabel(data.moneda)}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Items */}
            <div className="mt-4 overflow-hidden rounded-md border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-800 text-white">
                    <th className="px-2 py-2 text-left font-semibold">CANT.</th>
                    <th className="px-2 py-2 text-left font-semibold">UM</th>
                    <th className="px-2 py-2 text-left font-semibold">CÓD.</th>
                    <th className="px-2 py-2 text-left font-semibold">
                      DESCRIPCIÓN
                    </th>
                    <th className="px-2 py-2 text-right font-semibold">V/U</th>
                    <th className="px-2 py-2 text-right font-semibold">P/U</th>
                    <th className="px-2 py-2 text-right font-semibold">
                      IMPORTE
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-2 py-1.5">{item.cantidad}</td>
                      <td className="px-2 py-1.5">{item.unidad_de_medida}</td>
                      <td className="px-2 py-1.5">{item.codigo}</td>
                      <td className="px-2 py-1.5">{item.descripcion}</td>
                      <td className="px-2 py-1.5 text-right">
                        {Number(item.valor_unitario).toLocaleString("es-PE", {
                          minimumFractionDigits: 3,
                        })}
                      </td>
                      <td className="px-2 py-1.5 text-right">
                        {Number(item.precio_unitario).toLocaleString("es-PE", {
                          minimumFractionDigits: 3,
                        })}
                      </td>
                      <td className="px-2 py-1.5 text-right font-medium">
                        {formatMoney(item.total, symbol)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cuotas de crédito */}
            {data.venta_al_credito?.length > 0 && (
              <div className="mt-4 overflow-hidden rounded-md border">
                <p className="border-b bg-slate-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Venta al Crédito
                </p>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="px-3 py-1.5 text-left font-semibold text-slate-600">
                        CUOTA
                      </th>
                      <th className="px-3 py-1.5 text-left font-semibold text-slate-600">
                        FECHA DE PAGO
                      </th>
                      <th className="px-3 py-1.5 text-right font-semibold text-slate-600">
                        IMPORTE
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.venta_al_credito.map((cuota, index) => (
                      <tr key={index}>
                        <td className="px-3 py-1.5">{cuota.cuota}</td>
                        <td className="px-3 py-1.5">
                          {formatDate(String(cuota.fecha_de_pago))}
                        </td>
                        <td className="px-3 py-1.5 text-right font-medium">
                          {formatMoney(cuota.importe, symbol)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Totales */}
            <div className="mt-4 flex justify-end">
              <dl className="w-64 space-y-1 text-xs">
                {Number(data.total_gravada) > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500">GRAVADA</dt>
                    <dd className="font-medium">
                      {formatMoney(data.total_gravada, symbol)}
                    </dd>
                  </div>
                )}
                {Number(data.total_inafecta) > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500">INAFECTA</dt>
                    <dd className="font-medium">
                      {formatMoney(data.total_inafecta, symbol)}
                    </dd>
                  </div>
                )}
                {Number(data.total_exonerada) > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500">EXONERADA</dt>
                    <dd className="font-medium">
                      {formatMoney(data.total_exonerada, symbol)}
                    </dd>
                  </div>
                )}
                {Number(data.total_gratuita) > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500">GRATUITA</dt>
                    <dd className="font-medium">
                      {formatMoney(data.total_gratuita, symbol)}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-slate-500">
                    IGV {Number(data.porcentaje_de_igv).toFixed(2)} %
                  </dt>
                  <dd className="font-medium">
                    {formatMoney(data.total_igv, symbol)}
                  </dd>
                </div>
                {Number(data.total_descuento) > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500">DESCUENTO</dt>
                    <dd className="font-medium">
                      -{formatMoney(data.total_descuento, symbol)}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between border-t pt-1 text-sm">
                  <dt className="font-semibold">TOTAL</dt>
                  <dd className="font-bold">
                    {formatMoney(data.total, symbol)}
                  </dd>
                </div>
                {data.detraccion && (
                  <div className="flex justify-between text-amber-700">
                    <dt>
                      DETRACCIÓN {Number(data.detraccion_porcentaje).toFixed(2)}
                      %
                    </dt>
                    <dd className="font-medium">
                      {formatMoney(data.detraccion_total, "S/")}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Observaciones / condiciones */}
            <div className="mt-4 space-y-1 border-t pt-3 text-xs">
              {!!data.observaciones && (
                <p>
                  <span className="font-semibold">Observaciones: </span>
                  {data.observaciones}
                </p>
              )}
              {!!data.medio_de_pago && (
                <p>
                  <span className="font-semibold">Forma de Pago: </span>
                  {data.medio_de_pago}
                </p>
              )}
              {data.detraccion && (
                <>
                  {!!data.medio_de_pago_detraccion && (
                    <p>
                      <span className="font-semibold">
                        Operación sujeta al Sistema de Pago de Obligaciones
                        Tributarias.
                      </span>{" "}
                      {data.medio_de_pago_detraccion}
                    </p>
                  )}
                  {!!data.detraccion_tipo && (
                    <p>
                      <span className="font-semibold">Tipo de Detracción:</span>{" "}
                      {getNubefactDetractionTypeLabel(data.detraccion_tipo)}
                    </p>
                  )}
                </>
              )}
              {!!data.placa_vehiculo && (
                <p>
                  <span className="font-semibold">Placa: </span>
                  {data.placa_vehiculo}
                </p>
              )}
              {!!data.orden_compra_servicio && (
                <p>
                  <span className="font-semibold">
                    Orden de Compra/Servicio:{" "}
                  </span>
                  {data.orden_compra_servicio}
                </p>
              )}
            </div>

            {/* Nota informativa */}
            <div className="mt-4 rounded-md bg-slate-50 p-3 text-[11px] text-slate-500">
              Esta es una previsualización de los datos que se enviarán a
              Nubefact / SUNAT. El comprobante aún no ha sido emitido.
            </div>
          </div>
        )}
      </GeneralSheet>
    </>
  );
}
