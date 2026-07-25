"use client";

import { useState } from "react";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { NumberFormat } from "@/shared/components/NumberFormat";
import { CopyCell } from "@/shared/components/CopyCell";
import { ButtonAction } from "@/shared/components/ButtonAction";
import { usePurchaseRequestQuoteById } from "../lib/purchaseRequestQuote.hook";
import { EditDiscountCouponModal } from "./EditDiscountCouponModal";
import { BonusDiscountResource } from "../lib/purchaseRequestQuote.interface";
import { FileDown, Pencil } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { parse } from "date-fns";

interface PurchaseRequestQuoteDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  id: number;
}

type ItemRow = {
  key: string;
  description: string;
  descriptionCopyValue?: string;
  detail?: string;
  detailCopyValue?: string;
  badge?: { label: string; className: string };
  quantity?: number | string;
  unitPrice?: number;
  total: number;
  isDiscount?: boolean;
  coupon?: BonusDiscountResource;
};

const TYPE_DOCUMENT_LABEL: Record<string, string> = {
  COTIZACION: "Cotización",
  SOLICITUD_COMPRA: "Solicitud de Compra",
};

function Field({
  label,
  value,
  copy,
  mono,
}: {
  label: string;
  value?: string | number | null;
  copy?: boolean;
  mono?: boolean;
}) {
  if (value === undefined || value === null || value === "" || value === "-")
    return null;
  return (
    <div className="flex items-baseline justify-between gap-3 py-0.5">
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      {copy ? (
        <CopyCell
          value={String(value)}
          size="sm"
          font={mono ? "mono" : "normal"}
          className="truncate text-right font-medium"
        />
      ) : (
        <span
          className={`truncate text-right text-sm font-medium ${mono ? "font-mono" : ""}`}
        >
          {value}
        </span>
      )}
    </div>
  );
}

export default function PurchaseRequestQuoteDetailModal({
  open,
  onOpenChange,
  id,
}: PurchaseRequestQuoteDetailModalProps) {
  const { data: quote, isLoading } = usePurchaseRequestQuoteById(id);
  const [editingCoupon, setEditingCoupon] =
    useState<BonusDiscountResource | null>(null);

  const model = quote?.ap_vehicle?.model ?? quote?.model;
  const symbol = quote?.doc_type_currency_symbol ?? "";
  const typeDocumentLabel = quote
    ? (TYPE_DOCUMENT_LABEL[quote.type_document] ?? quote.type_document)
    : "";

  const items: ItemRow[] = [];
  if (quote) {
    const modelCodeAndVersion = [quote.ap_model_vn, model?.version]
      .filter(Boolean)
      .join(" · ");

    items.push({
      key: "vehicle",
      description: quote.ap_vehicle?.vin
        ? `VIN ${quote.ap_vehicle.vin}`
        : (quote.ap_model_vn ?? "Vehículo"),
      descriptionCopyValue: quote.ap_vehicle?.vin,
      detail: quote.ap_vehicle?.vin
        ? modelCodeAndVersion || undefined
        : quote.vehicle_color || undefined,
      detailCopyValue:
        quote.ap_vehicle?.vin && modelCodeAndVersion
          ? quote.ap_model_vn
          : undefined,
      quantity: 1,
      unitPrice: Number(quote.base_selling_price),
      total: Number(quote.base_selling_price),
    });

    quote.accessories?.forEach((accessory) => {
      const effectivePrice =
        Number(accessory.price) + Number(accessory.additional_price ?? 0);
      const localTotal = effectivePrice * accessory.quantity;
      const sameCurrency =
        accessory.type_currency_code === quote.doc_type_currency;
      const converted = sameCurrency
        ? localTotal
        : localTotal / quote.exchange_rate;

      items.push({
        key: `accessory-${accessory.id}`,
        description: accessory.description,
        detail: `#${accessory.approved_accessory_id}`,
        badge:
          accessory.type === "OBSEQUIO"
            ? { label: "Obsequio", className: "bg-green-100 text-green-800" }
            : { label: "Adicional", className: "bg-blue-100 text-primary" },
        quantity: accessory.quantity,
        unitPrice: effectivePrice,
        total: converted,
      });
    });

    quote.others?.forEach((other) => {
      items.push({
        key: `other-${other.id}`,
        description: other.description,
        badge: { label: "Cargo", className: "bg-muted text-muted-foreground" },
        total: Number(other.amount),
      });
    });

    quote.bonus_discounts?.forEach((item) => {
      const amount = Number(item.amount);
      items.push({
        key: `bonus-${item.id}`,
        description: item.description,
        detail: item.concept_code,
        badge:
          item.type === "PORCENTAJE"
            ? {
                label: `${item.percentage}%`,
                className: "bg-muted text-muted-foreground",
              }
            : undefined,
        total: item.is_negative ? -amount : amount,
        isDiscount: true,
        coupon: item,
      });
    });
  }

  const specs = model
    ? (
        [
          ["Marca", model.brand],
          ["Familia", model.family],
          ["Tipo", model.vehicle_type],
          ["Carrocería", model.body_type],
          ["Combustible", model.fuel],
          ["Tracción", model.traction_type],
          ["Transmisión", model.transmission],
          ["Potencia", model.power],
          ["Cilindrada", model.displacement],
          ["Cilindros", model.cylinders_number],
          ["Asientos", model.seats_number],
          ["Puertas", model.doors_number],
          ["Distancia Ejes", model.wheelbase],
          ["Peso Neto", model.net_weight],
          ["Peso Bruto", model.gross_weight],
          ["Carga Útil", model.payload],
          ["Tipo Motor", quote?.ap_vehicle?.engine_type],
        ] as [string, string | number | undefined][]
      ).filter(
        ([, v]) => v !== undefined && v !== null && v !== "" && v !== "-",
      )
    : [];

  const electronicDocuments = quote?.electronic_documents ?? [];

  return (
    <GeneralSheet
      open={open}
      onClose={() => onOpenChange(false)}
      title="Detalle de Cotización"
      subtitle={
        quote ? `${quote.correlative} - ${typeDocumentLabel}` : undefined
      }
      icon="FileText"
      side="right"
      size="4xl"
      isLoading={isLoading}
    >
      {quote && (
        <div className="divide-y divide-border text-sm">
          {/* Encabezado */}
          <div className="flex items-start justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {typeDocumentLabel}
              </p>
              <CopyCell
                value={quote.correlative}
                label={quote.correlative}
                size="lg"
                font="mono"
                className="font-bold tracking-wide"
              />
            </div>
            <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
              <Badge
                color={quote.is_approved ? "default" : "secondary"}
                className={quote.is_approved ? "bg-primary" : "bg-secondary"}
              >
                {quote.is_approved ? "Aprobado" : "Pendiente"}
              </Badge>
              {quote.is_invoiced ? (
                <Badge className="bg-emerald-600">Facturado</Badge>
              ) : null}
              {quote.is_paid ? (
                <Badge className="bg-blue-600">Pagado</Badge>
              ) : null}
            </div>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-0.5 py-3">
            <Field
              label="Fecha límite"
              value={
                quote.quote_deadline
                  ? parse(
                      quote.quote_deadline,
                      "yyyy-MM-dd",
                      new Date(),
                    ).toLocaleDateString("es-PE", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                  : "N/A"
              }
            />
            <Field label="Sede" value={quote.sede} />
            <Field label="Asesor" value={quote.consultant?.name} />
            <Field
              label="Garantía"
              value={
                quote.warranty_years && quote.warranty_km
                  ? `${quote.warranty_years}a / ${quote.warranty_km.toLocaleString("es-PE")}km`
                  : "N/A"
              }
            />
            <Field
              label="Moneda"
              value={quote.type_currency || quote.doc_type_currency}
            />
            <Field label="T. Cambio" value={quote.exchange_rate} />
          </div>

          {/* Cliente / Vehículo */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
            <div className="min-w-0 py-3 md:pr-4">
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Titular
              </p>
              <p className="truncate font-semibold">{quote.holder}</p>
              {quote.client_name && quote.client_name !== quote.holder && (
                <p className="truncate text-xs text-muted-foreground">
                  {quote.client_name}
                </p>
              )}
              <div className="mt-1.5">
                <Field
                  label={quote.holder_document_type === 810 ? "RUC" : "DNI"}
                  value={quote.holder_document_number}
                  copy
                  mono
                />
                <Field label="Teléfono" value={quote.holder_phone} copy mono />
                <Field label="Email" value={quote.holder_email} copy />
                <Field label="Dirección" value={quote.holder_address} />
              </div>
            </div>

            <div className="min-w-0 py-3 md:pl-4">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Vehículo
                </p>
                {quote.ap_vehicle?.vehicle_status && (
                  <span
                    className="inline-block shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                    style={{
                      backgroundColor: quote.ap_vehicle.status_color
                        ? `${quote.ap_vehicle.status_color}22`
                        : undefined,
                      color: quote.ap_vehicle.status_color || undefined,
                    }}
                  >
                    {quote.ap_vehicle.vehicle_status}
                  </span>
                )}
              </div>
              <p className="truncate font-semibold">
                {quote.ap_model_vn || "N/A"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {[quote.vehicle_color, quote.type_vehicle]
                  .filter(Boolean)
                  .join(" · ") || "N/A"}
              </p>
              <div className="mt-1.5">
                <Field label="VIN" value={quote.ap_vehicle?.vin} copy mono />
                <Field
                  label="Placa"
                  value={quote.ap_vehicle?.plate}
                  copy
                  mono
                />
                <Field
                  label="N° Motor"
                  value={quote.ap_vehicle?.engine_number}
                  copy
                  mono
                />
                <Field label="Año" value={quote.ap_vehicle?.year} />
                <Field
                  label="Ubicación"
                  value={
                    [
                      quote.ap_vehicle?.warehouse_name,
                      quote.ap_vehicle?.sede_name_warehouse,
                    ]
                      .filter(Boolean)
                      .join(" - ") || undefined
                  }
                />
              </div>
            </div>
          </div>

          {/* Detalle */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="h-9 pl-0">Descripción</TableHead>
                <TableHead className="h-9 px-2 text-right">Cant.</TableHead>
                <TableHead className="h-9 px-2 text-right">P. Unit.</TableHead>
                <TableHead className="h-9 pr-0 text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.key}>
                  <TableCell className="py-2 pl-0">
                    <div className="flex items-center gap-2">
                      {item.descriptionCopyValue ? (
                        <CopyCell
                          value={item.descriptionCopyValue}
                          label={item.description}
                          size="sm"
                          font="mono"
                          className="truncate font-semibold"
                        />
                      ) : (
                        <p className="truncate font-medium">
                          {item.description}
                        </p>
                      )}
                      {item.badge && (
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${item.badge.className}`}
                        >
                          {item.badge.label}
                        </span>
                      )}
                    </div>
                    {item.detail &&
                      (item.detailCopyValue ? (
                        <CopyCell
                          value={item.detailCopyValue}
                          label={item.detail}
                          size="xs"
                          font="mono"
                          className="truncate text-muted-foreground"
                        />
                      ) : (
                        <p className="truncate font-mono text-xs text-muted-foreground">
                          {item.detail}
                        </p>
                      ))}
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-2 py-2 text-right">
                    {item.quantity ?? "-"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-2 py-2 text-right">
                    {item.unitPrice != null ? (
                      <NumberFormat value={item.unitPrice} prefix={symbol} />
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell
                    className={`whitespace-nowrap py-2 pr-0 text-right font-semibold ${
                      item.isDiscount
                        ? item.total < 0
                          ? "text-red-600"
                          : "text-primary"
                        : ""
                    }`}
                  >
                    <span className="inline-flex items-center gap-1 justify-end">
                      {item.isDiscount && item.total >= 0 && "+ "}
                      <NumberFormat value={item.total} prefix={symbol} />
                      {item.coupon && !item.coupon.is_negative && quote.is_invoiced ? (
                        <ButtonAction
                          tooltip="Editar bono / descuento"
                          icon={Pencil}
                          color="blue"
                          onClick={() => setEditingCoupon(item.coupon!)}
                        />
                      ) : null}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Totales */}
          <div className="flex justify-end py-3">
            <div className="w-full max-w-[260px] space-y-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-semibold">Precio de venta</span>
                <span className="whitespace-nowrap text-xl font-bold text-green-600">
                  <NumberFormat
                    value={Number(quote.sale_price)}
                    prefix={symbol}
                  />
                </span>
              </div>

              {quote.down_payment != null && (
                <>
                  <Separator className="my-1.5" />
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-muted-foreground">A cuenta</span>
                    <span className="whitespace-nowrap font-medium text-blue-600">
                      -{" "}
                      <NumberFormat
                        value={Number(quote.down_payment)}
                        prefix={symbol}
                      />
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-semibold">Saldo pendiente</span>
                    <span className="whitespace-nowrap font-bold">
                      <NumberFormat
                        value={
                          Number(quote.sale_price) - Number(quote.down_payment)
                        }
                        prefix={symbol}
                      />
                    </span>
                  </div>
                </>
              )}

              {quote.is_invoiced ? (
                <>
                  <Separator className="my-1.5" />
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs text-muted-foreground">
                      Margen
                    </span>
                    <span className="whitespace-nowrap text-xs font-medium text-muted-foreground">
                      <NumberFormat
                        value={Number(quote.margin_amount)}
                        prefix={symbol}
                      />{" "}
                      ({Number(quote.margin_pct).toFixed(1)}%)
                    </span>
                  </div>
                </>
              ) : null}
            </div>
          </div>

          {/* Comprobantes electrónicos (solo si ya se facturó) */}
          {electronicDocuments.length > 0 && (
            <div className="py-3">
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Comprobantes Emitidos
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="h-9 pl-0">Documento</TableHead>
                    <TableHead className="h-9 px-2">Emisión</TableHead>
                    <TableHead className="h-9 px-2">Estado</TableHead>
                    <TableHead className="h-9 px-2 text-right">Total</TableHead>
                    <TableHead className="h-9 pr-0 text-right">PDF</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {electronicDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="py-2 pl-0">
                        <p className="truncate font-medium">
                          {doc.document_type?.description ?? "Comprobante"}
                        </p>
                        <CopyCell
                          value={doc.full_number}
                          size="xs"
                          font="mono"
                          className="truncate text-muted-foreground"
                        />
                      </TableCell>
                      <TableCell className="whitespace-nowrap px-2 py-2">
                        {doc.fecha_de_emision
                          ? new Date(doc.fecha_de_emision).toLocaleDateString(
                              "es-PE",
                            )
                          : "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap px-2 py-2">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            doc.status === "accepted"
                              ? "bg-emerald-100 text-emerald-800"
                              : doc.status === "rejected" ||
                                  doc.status === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {doc.status === "accepted"
                            ? "Aceptado"
                            : doc.status === "rejected"
                              ? "Rechazado"
                              : doc.status === "cancelled"
                                ? "Anulado"
                                : doc.status === "sent"
                                  ? "Enviado"
                                  : doc.status}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap px-2 py-2 text-right font-semibold">
                        <NumberFormat
                          value={Number(doc.total)}
                          prefix={symbol}
                        />
                      </TableCell>
                      <TableCell className="whitespace-nowrap py-2 pr-0 text-right">
                        {doc.enlace_del_pdf && (
                          <ButtonAction
                            tooltip="Descargar PDF"
                            icon={FileDown}
                            color="blue"
                            onClick={() =>
                              window.open(doc.enlace_del_pdf, "_blank")
                            }
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Especificaciones técnicas */}
          {specs.length > 0 && (
            <div className="py-3">
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Especificaciones técnicas
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-0.5">
                {specs.map(([label, value]) => (
                  <Field key={label} label={label} value={value} />
                ))}
              </div>
            </div>
          )}

          {/* Comentarios */}
          {quote.comment && (
            <div className="py-3">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Comentarios
              </p>
              <p className="whitespace-pre-wrap wrap-break-word text-sm text-muted-foreground">
                {quote.comment}
              </p>
            </div>
          )}
        </div>
      )}

      <EditDiscountCouponModal
        open={!!editingCoupon}
        onClose={() => setEditingCoupon(null)}
        coupon={editingCoupon}
        currencySymbol={symbol}
      />
    </GeneralSheet>
  );
}
