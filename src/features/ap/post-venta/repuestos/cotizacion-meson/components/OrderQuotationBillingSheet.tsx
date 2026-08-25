import GeneralSheet from "@/shared/components/GeneralSheet";
import { DetailSheetTable } from "@/shared/components/DetailSheetTable";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  XCircle,
  Clock,
  Send,
  Ban,
  FileText,
  Loader2,
  PenLine,
  AlertTriangle,
  User,
  Calendar,
  MessageSquare,
  ShieldCheck,
  IdCard,
  PackageCheck,
  Truck,
  RefreshCw,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { findOrderQuotationById } from "../../../taller/cotizacion/lib/proforma.actions";
import type { OrderQuotationResource } from "../../../taller/cotizacion/lib/proforma.interface";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { SignaturePad } from "../../../taller/inspeccion-vehiculo/components/SignaturePad";
import {
  confirmOrderQuotation,
  recalculateOrderQuotationTotals,
} from "../lib/quotationMeson.actions";
import {
  errorToast,
  formatDate,
  formatDateTime,
  formatMoney,
  successToast,
} from "@/core/core.function";
import { useMemo, useEffect } from "react";
import { InfoSection } from "@/shared/components/InfoSection";
import { FormTextArea } from "@/shared/components/FormTextArea";
import { CopyCell } from "@/shared/components/CopyCell";
import { onSelectSupplyType } from "@/features/ap/post-venta/taller/cotizacion-detalle/lib/proformaDetails.constants";
import {
  STATUS_ORDER_QUOTE,
  STATUS_ORDER_QUOTE_COLOR,
} from "../../../taller/cotizacion/lib/proforma.constants";

interface OrderQuotationBillingSheetProps {
  orderQuotationId: number | null;
  open: boolean;
  onClose: () => void;
  onRefresh?: () => void;
  readOnly?: boolean;
}

export function OrderQuotationBillingSheet({
  orderQuotationId,
  open,
  onClose,
  onRefresh,
  readOnly = false,
}: OrderQuotationBillingSheetProps) {
  const { data: orderQuotation, isLoading } = useQuery({
    queryKey: ["orderQuotation", orderQuotationId],
    queryFn: () => findOrderQuotationById(orderQuotationId!),
    enabled: open && orderQuotationId !== null,
  });

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title="Detalle de Cotización"
      subtitle={
        orderQuotation
          ? `Cotización ${orderQuotation.quotation_number}`
          : "Cargando..."
      }
      icon="Receipt"
      size="4xl"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !orderQuotation ? (
        <div className="flex flex-col items-center justify-center py-12 text-center px-6">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-sm">
            No se pudo cargar la información de la cotización
          </p>
        </div>
      ) : (
        <BillingSheetContent
          orderQuotation={orderQuotation}
          onRefresh={onRefresh}
          readOnly={readOnly}
        />
      )}
    </GeneralSheet>
  );
}

interface BillingSheetContentProps {
  orderQuotation: OrderQuotationResource;
  onRefresh?: () => void;
  readOnly?: boolean;
}

const signatureSchema = z.object({
  notes: z.string().optional(),
  customer_signature: z.string().min(1, "La firma del cliente es requerida"),
});

type SignatureFormData = z.infer<typeof signatureSchema>;

export function BillingSheetContent({
  orderQuotation,
  onRefresh,
  readOnly = false,
}: BillingSheetContentProps) {
  const statusConfig = {
    draft: {
      label: "Borrador",
      icon: FileText,
      className: "bg-gray-100 text-gray-700 border-gray-300",
    },
    sent: {
      label: "Enviado",
      icon: Send,
      className: "bg-blue-100 text-blue-700 border-blue-300",
    },
    accepted: {
      label: "Aceptado",
      icon: CheckCircle,
      className: "bg-green-100 text-green-700 border-green-300",
    },
    rejected: {
      label: "Rechazado",
      icon: XCircle,
      className: "bg-red-100 text-red-700 border-red-300",
    },
    cancelled: {
      label: "Anulado",
      icon: Ban,
      className: "bg-orange-100 text-orange-700 border-orange-300",
    },
  };
  const queryClient = useQueryClient();
  const activeVouchers = orderQuotation.vouchers?.active ?? [];
  const hasAdvances = activeVouchers.length > 0;
  const currencySymbol = orderQuotation.type_currency?.symbol || "S/.";

  const recalculateTotalsMutation = useMutation({
    mutationFn: () => recalculateOrderQuotationTotals(orderQuotation.id),
    onSuccess: () => {
      successToast("Montos recalculados correctamente");
      queryClient.invalidateQueries({
        queryKey: ["orderQuotation", orderQuotation.id],
      });
      onRefresh?.();
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message || "Error al recalcular los montos",
      );
    },
  });

  // Verificar si debe mostrar la sección de firma
  const shouldShowSignature =
    orderQuotation.status.id === STATUS_ORDER_QUOTE.APERTURADO;

  const form = useForm<SignatureFormData>({
    resolver: zodResolver(signatureSchema),
    defaultValues: {
      notes: "",
      customer_signature: "",
    },
  });

  // Formulario para "Facturar a"
  const invoiceToForm = useForm<{ invoice_to_id: string }>({
    defaultValues: { invoice_to_id: "" },
  });

  const invoiceToDefaultOption = useMemo(() => {
    if (orderQuotation.invoice_to) {
      return {
        value: orderQuotation.invoice_to.toString(),
        label: `${orderQuotation.invoice_to_client?.full_name} - ${orderQuotation.invoice_to_client?.num_doc || "S/N"}`,
      };
    }
    return undefined;
  }, [orderQuotation.invoice_to, orderQuotation.invoice_to_client]);

  useEffect(() => {
    if (invoiceToDefaultOption) {
      invoiceToForm.setValue("invoice_to_id", invoiceToDefaultOption.value);
    }
  }, [invoiceToDefaultOption, invoiceToForm]);

  const confirmMutation = useMutation({
    mutationFn: (data: SignatureFormData) =>
      confirmOrderQuotation(orderQuotation.id, data),
    onSuccess: () => {
      successToast("Firma registrada exitosamente");
      queryClient.invalidateQueries({
        queryKey: ["orderQuotation", orderQuotation.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["useOrderQuotations"],
      });
      form.reset();
      onRefresh?.();
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message ||
          "Error al registrar la firma. Intente nuevamente.",
      );
    },
  });

  const onSubmitSignature = (data: SignatureFormData) => {
    confirmMutation.mutate(data);
  };

  return (
    <div className="space-y-6 px-6">
      {/* Estado de la Cotización */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Estado de la Cotización</h3>
        <div className="bg-muted/30 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            {(() => {
              const StatusIcon =
                orderQuotation.status.id === STATUS_ORDER_QUOTE.DESCARTADO
                  ? XCircle
                  : orderQuotation.status.id === STATUS_ORDER_QUOTE.FACTURAR
                    ? Clock
                    : orderQuotation.status.id === STATUS_ORDER_QUOTE.FACTURADO
                      ? CheckCircle
                      : FileText;

              return (
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
                  <StatusIcon className="h-5 w-5 text-gray-600" />
                </div>
              );
            })()}
            <div>
              <Badge
                variant="outline"
                color={
                  STATUS_ORDER_QUOTE_COLOR[orderQuotation.status.id] ??
                  "default"
                }
              >
                {orderQuotation.status.description}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">
                {orderQuotation.status.id === STATUS_ORDER_QUOTE.DESCARTADO
                  ? "Esta cotización ha sido descartada"
                  : orderQuotation.status.id === STATUS_ORDER_QUOTE.APERTURADO
                    ? "Cotización abierta, pendiente de confirmación"
                    : orderQuotation.status.id === STATUS_ORDER_QUOTE.FACTURAR
                      ? "Cotización confirmada, lista para facturar"
                      : orderQuotation.status.id ===
                          STATUS_ORDER_QUOTE.FACTURADO
                        ? "Cotización completamente facturada"
                        : "Estado de la cotización"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Información de Descarte (solo si fue descartada) */}
      {orderQuotation.status.id === STATUS_ORDER_QUOTE.DESCARTADO && (
        <>
          <Separator />
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Información de Descarte
            </h3>
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Motivo de Descarte
                    </p>
                    <p className="text-sm font-medium text-red-700">
                      {(orderQuotation as any).discard_reason ||
                        "No especificado"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Descartado Por
                    </p>
                    <p className="text-sm font-medium">
                      {(orderQuotation as any).discarded_by_name || "SIAN"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Fecha de Descarte
                    </p>
                    <p className="text-sm font-medium">
                      {formatDateTime((orderQuotation as any).discarded_at) ??
                        "N/A"}
                    </p>
                  </div>
                </div>
              </div>
              {(orderQuotation as any).discarded_note && (
                <div className="pt-2 border-t border-red-200">
                  <p className="text-xs text-muted-foreground mb-1">
                    Notas Adicionales
                  </p>
                  <p className="text-sm text-red-700 bg-red-100/50 p-2 rounded">
                    {(orderQuotation as any).discarded_note}
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <Separator />

      {/* Información del Cliente */}
      <InfoSection
        title="Información del Cliente"
        fields={[
          {
            label: "Cliente",
            value: orderQuotation.client?.full_name || "N/A",
            fullWidth: true,
          },
          { label: "Documento", value: orderQuotation.client.num_doc || "N/A" },
          { label: "Teléfono", value: orderQuotation.client.phone || "N/A" },
          { label: "Email", value: orderQuotation.client.email || "N/A" },
          {
            label: "Dirección",
            value: orderQuotation.client.direction || "N/A",
          },
        ]}
      />

      {/* Información del Vehículo (solo si hay vehículo asociado) */}
      {orderQuotation.vehicle && (
        <>
          <Separator />
          <InfoSection
            title="Información del Vehículo"
            fields={[
              { label: "Placa", value: orderQuotation.vehicle.plate || "-" },
              { label: "VIN", value: orderQuotation.vehicle.vin || "-" },
              {
                label: "Marca",
                value: orderQuotation.vehicle.model?.brand || "-",
              },
              {
                label: "Modelo",
                value: orderQuotation.vehicle.model?.version || "-",
              },
              { label: "Año", value: orderQuotation.vehicle.year || "-" },
              {
                label: "Color",
                value: orderQuotation.vehicle.vehicle_color || "-",
              },
            ]}
          />
        </>
      )}

      <Separator />

      {/* Información de la Cotización */}
      <InfoSection
        title="Información de la Cotización"
        fields={[
          {
            label: "Número de Cotización",
            value: orderQuotation.quotation_number,
          },
          {
            label: "Fecha Cotización",
            value: orderQuotation.quotation_date
              ? formatDate(orderQuotation.quotation_date)
              : "N/A",
          },
          {
            label: "Fecha Vencimiento",
            value: orderQuotation.expiration_date
              ? formatDate(orderQuotation.expiration_date)
              : "N/A",
          },
          {
            label: "Moneda",
            value: (
              <Badge variant="outline">
                {orderQuotation.type_currency?.name || "N/A"}
              </Badge>
            ),
          },
          ...(orderQuotation.observations
            ? [
                {
                  label: "Observaciones",
                  value: orderQuotation.observations,
                  fullWidth: true,
                },
              ]
            : []),
        ]}
      />

      <Separator />

      {/* Confirmación virtual */}
      {orderQuotation.confirmed_at && (
        <>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-lg">Confirmación</h3>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2 text-sm">
              {orderQuotation.confirmation_metadata?.confirmed_by_name && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Confirmado por</span>
                  <span className="font-medium">
                    {orderQuotation.confirmation_metadata.confirmed_by_name}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha</span>
                <span className="font-medium">
                  {formatDate(orderQuotation.confirmed_at)}
                </span>
              </div>
              {orderQuotation.confirmation_channel && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Canal</span>
                  <span className="font-medium capitalize">
                    {orderQuotation.confirmation_channel}
                  </span>
                </div>
              )}
              {orderQuotation.confirmation_metadata?.notes && (
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground shrink-0">Notas</span>
                  <span className="font-medium text-right">
                    {orderQuotation.confirmation_metadata.notes}
                  </span>
                </div>
              )}
              {orderQuotation.confirmation_ip && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IP</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {orderQuotation.confirmation_ip}
                  </span>
                </div>
              )}
            </div>
          </div>
          <Separator />
        </>
      )}

      {/* Detalle de Productos/Repuestos */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Detalle de Repuestos</h3>
        <DetailSheetTable
          rows={orderQuotation.details ?? []}
          getKey={(detail) => detail.id}
          getRowClassName={(detail) =>
            detail.is_traverse ? "bg-amber-50/60 hover:bg-amber-50" : undefined
          }
          columns={[
            {
              header: "#",
              className: "text-left",
              render: (_, index) => <div className="text-sm">{index + 1}</div>,
            },
            {
              header: "Repuesto",
              render: (detail) => (
                <>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <div className="text-sm">{detail.description}</div>
                    {detail.is_traverse && (
                      <Badge
                        color="orange"
                        icon={Truck}
                        tooltip="Producto en travesía"
                      >
                        Travesía
                      </Badge>
                    )}
                  </div>
                  {detail.product?.code ? (
                    <CopyCell
                      value={detail.product.code}
                      label={`Cód: ${detail.product.code}`}
                      className="text-xs text-muted-foreground"
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Cód: N/A
                    </span>
                  )}
                  {detail.product?.dyn_code ? (
                    <CopyCell
                      value={detail.product.dyn_code}
                      label={`Cód Dyn: ${detail.product.dyn_code}`}
                      className="text-xs text-muted-foreground"
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Cód Dyn: N/A
                    </span>
                  )}
                </>
              ),
            },
            {
              header: "Tip. Abast.",
              className: "text-center",
              render: (detail) => (
                <>
                  <div className="text-sm">
                    {onSelectSupplyType.find(
                      (option) => option.value === detail.supply_type,
                    )?.label ||
                      detail.supply_type ||
                      "-"}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {detail.observations || ""}
                  </span>
                </>
              ),
            },
            {
              header: "Cant.",
              className: "text-center",
              render: (detail) => (
                <div className="text-sm">
                  {detail.quantity} {detail.unit_measure}
                </div>
              ),
            },
            {
              header: "P. Unit.",
              className: "text-right",
              render: (detail) => (
                <div className="text-sm font-medium">
                  {formatMoney(detail.unit_price, 2, currencySymbol)}
                </div>
              ),
            },
            {
              header: "% Desc.",
              className: "text-right",
              render: (detail) => (
                <div className="text-sm font-medium">
                  {Number(detail.discount_percentage).toLocaleString("es-PE", {
                    minimumFractionDigits: 2,
                  })}
                </div>
              ),
            },
            {
              header: "Cto. Total",
              className: "text-right",
              render: (detail) => (
                <div className="text-sm font-semibold">
                  {formatMoney(detail.total_cost, 2, currencySymbol)}
                </div>
              ),
            },
            {
              header: "Neto",
              className: "text-right",
              render: (detail) => (
                <div className="text-sm font-semibold">
                  {formatMoney(detail.net_amount, 2, currencySymbol)}
                </div>
              ),
            },
          ]}
        />

        {/* Totales de la Cotización */}
        <div className="space-y-2 bg-muted/30 p-4 rounded-lg">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">
              {formatMoney(orderQuotation.subtotal, 2, currencySymbol)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Descuento</span>
            <span className="font-medium">
              {formatMoney(orderQuotation.discount_amount, 2, currencySymbol)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">OP. Gravadas</span>
            <span className="font-medium">
              {formatMoney(orderQuotation.op_gravada, 2, currencySymbol)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">IGV (18%)</span>
            <span className="font-medium">
              {formatMoney(
                (orderQuotation.details ?? []).reduce(
                  (sum, detail) => sum + Number(detail.tax_amount),
                  0,
                ),
                2,
                currencySymbol,
              )}
            </span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between text-base font-bold text-primary">
            <span>Total</span>
            <span>
              {formatMoney(orderQuotation.total_amount, 2, currencySymbol)}
            </span>
          </div>
        </div>
      </div>

      {/* Sección de Firma del Cliente */}
      {shouldShowSignature && !readOnly && (
        <>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmitSignature)}
              className="space-y-4"
            >
              <GroupFormSection
                title="Firma de Conformidad del Cliente"
                icon={PenLine}
                color="primary"
                cols={{ sm: 1 }}
              >
                <FormField
                  control={form.control}
                  name="customer_signature"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <SignaturePad
                          label="Firma del Cliente"
                          value={field.value}
                          onChange={field.onChange}
                          disabled={confirmMutation.isPending}
                          required
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormTextArea
                  control={form.control}
                  name="notes"
                  label="Notas adicionales (opcional)"
                  placeholder="Escribe aquí..."
                  disabled={confirmMutation.isPending}
                />
              </GroupFormSection>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={
                    confirmMutation.isPending || !form.formState.isValid
                  }
                >
                  {confirmMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {confirmMutation.isPending
                    ? "Confirmando..."
                    : "Confirmar Cotización"}
                </Button>
              </div>
            </form>
          </Form>
        </>
      )}

      <Separator />

      {/* Facturas y Anticipos */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">
            Documentos Electrónicos ({activeVouchers.length})
          </h3>
          <div className="flex items-center gap-2">
            {hasAdvances && (
              <Badge variant="outline" className="text-sm">
                Pagado:{" "}
                {formatMoney(
                  orderQuotation.payment_summary?.paid_amount,
                  2,
                  currencySymbol,
                )}
              </Badge>
            )}
            {!readOnly && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={recalculateTotalsMutation.isPending}
                onClick={() => recalculateTotalsMutation.mutate()}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${recalculateTotalsMutation.isPending ? "animate-spin" : ""}`}
                />
                Recalcular Montos
              </Button>
            )}
          </div>
        </div>

        {!hasAdvances ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-sm">
              No hay facturas o anticipos asociados a esta cotización
            </p>
          </div>
        ) : (
          <DetailSheetTable
            rows={activeVouchers}
            getKey={(doc) => doc.id}
            columns={[
              {
                header: "Documento",
                render: (doc) => (
                  <div className="font-medium">
                    {doc.serie}-{String(doc.numero).padStart(8, "0")}
                  </div>
                ),
              },
              {
                header: "Tipo",
                render: (doc) => (
                  <>
                    <div className="text-sm">{doc.document_type}</div>
                    {doc.is_advance_payment && (
                      <Badge color="secondary" className="text-xs mt-1">
                        Anticipo
                      </Badge>
                    )}
                  </>
                ),
              },
              {
                header: "Cliente",
                render: (doc) => (
                  <>
                    <div className="text-sm font-medium">{doc.client_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {doc.client_document}
                    </div>
                  </>
                ),
              },
              {
                header: "Fecha Emisión",
                render: (doc) => (
                  <div className="text-sm">{formatDate(doc.issue_date)}</div>
                ),
              },
              {
                header: "Estado SUNAT",
                render: (doc) => (
                  <div className="text-sm text-muted-foreground">
                    {doc.sunat_responsecode || "-"}
                  </div>
                ),
              },
              {
                header: "Estado",
                render: (doc) => {
                  const config =
                    statusConfig[doc.status as keyof typeof statusConfig];
                  const StatusIcon = config?.icon || FileText;
                  return (
                    <Badge
                      variant="outline"
                      className={`${config?.className} flex items-center gap-1 w-fit`}
                    >
                      <StatusIcon className="h-3 w-3" />
                      <span>{config?.label || doc.status}</span>
                    </Badge>
                  );
                },
              },
              {
                header: "Monto",
                className: "text-right",
                render: (doc) => (
                  <div className="font-semibold w-20">
                    {formatMoney(doc.total, 2, currencySymbol)}
                  </div>
                ),
              },
            ]}
            footer={
              <div className="space-y-2 bg-primary/5 p-4 rounded-lg border border-primary/20">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Total Cotización
                  </span>
                  <span className="font-medium">
                    {formatMoney(
                      orderQuotation.total_amount,
                      2,
                      currencySymbol,
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Pagado</span>
                  <span className="font-medium">
                    {formatMoney(
                      orderQuotation.payment_summary?.paid_amount ?? 0,
                      2,
                      currencySymbol,
                    )}
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-base font-bold text-primary">
                  <span>Saldo Pendiente</span>
                  <span>
                    {formatMoney(
                      orderQuotation.payment_summary?.remaining_balance ??
                        orderQuotation.total_amount,
                      2,
                      currencySymbol,
                    )}
                  </span>
                </div>
              </div>
            }
          />
        )}
      </div>

      {/* Datos de Entrega */}
      {orderQuotation.delivery_document_number && (
        <>
          <Separator />
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <PackageCheck className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Entrega Registrada</h3>
            </div>
            <div className="bg-blue-50 border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <IdCard className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    DNI del Receptor
                  </p>
                  <p className="text-sm font-semibold">
                    {orderQuotation.delivery_document_number}
                  </p>
                </div>
              </div>
              {orderQuotation.customer_signature_delivery_url && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <PenLine className="h-4 w-4 text-primary shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      Firma del Receptor
                    </p>
                  </div>
                  <div className="flex justify-center items-center bg-white border border-blue-200 rounded-lg p-4 min-h-[120px]">
                    <img
                      src={orderQuotation.customer_signature_delivery_url}
                      alt="Firma del receptor"
                      className="h-24 w-auto object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
