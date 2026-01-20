import GeneralSheet from "@/shared/components/GeneralSheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { confirmOrderQuotation } from "../lib/quotationMeson.actions";
import { errorToast, successToast } from "@/core/core.function";

interface OrderQuotationBillingSheetProps {
  orderQuotationId: number | null;
  open: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

export function OrderQuotationBillingSheet({
  orderQuotationId,
  open,
  onClose,
  onRefresh,
}: OrderQuotationBillingSheetProps) {
  const { data: orderQuotation, isLoading } = useQuery({
    queryKey: ["orderQuotation", orderQuotationId],
    queryFn: () => findOrderQuotationById(orderQuotationId!),
    enabled: open && orderQuotationId !== null,
  });

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

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title="Facturas Asociadas"
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
          statusConfig={statusConfig}
          onRefresh={onRefresh}
        />
      )}
    </GeneralSheet>
  );
}

interface BillingSheetContentProps {
  orderQuotation: OrderQuotationResource;
  statusConfig: {
    draft: { label: string; icon: any; className: string };
    sent: { label: string; icon: any; className: string };
    accepted: { label: string; icon: any; className: string };
    rejected: { label: string; icon: any; className: string };
    cancelled: { label: string; icon: any; className: string };
  };
  onRefresh?: () => void;
}

const signatureSchema = z.object({
  customer_signature: z.string().min(1, "La firma del cliente es requerida"),
});

type SignatureFormData = z.infer<typeof signatureSchema>;

function BillingSheetContent({
  orderQuotation,
  statusConfig,
  onRefresh,
}: BillingSheetContentProps) {
  const queryClient = useQueryClient();
  const advances = orderQuotation.advances || [];
  const hasAdvances = advances.length > 0;
  const totalAdvances = advances.reduce((sum, doc) => sum + doc.total, 0);
  const currencySymbol = orderQuotation.type_currency?.symbol || "S/.";

  // Verificar si debe mostrar la sección de firma
  const shouldShowSignature =
    orderQuotation.status === "Aperturado" &&
    !orderQuotation.customer_signature;

  const form = useForm<SignatureFormData>({
    resolver: zodResolver(signatureSchema),
    defaultValues: {
      customer_signature: "",
    },
  });

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
      {/* Información del Cliente */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Información del Cliente</h3>
        <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
          <div className="col-span-2">
            <p className="text-xs text-muted-foreground">Cliente</p>
            <p className="text-sm font-semibold">
              {orderQuotation.vehicle?.owner?.full_name || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Documento</p>
            <p className="text-sm font-medium">
              {orderQuotation.vehicle?.owner?.num_doc || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Teléfono</p>
            <p className="text-sm font-medium">
              {orderQuotation.vehicle?.owner?.phone || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="text-sm font-medium">
              {orderQuotation.vehicle?.owner?.email || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Dirección</p>
            <p className="text-sm font-medium">
              {orderQuotation.vehicle?.owner?.direction || "N/A"}
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Información del Vehículo */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Información del Vehículo</h3>
        <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
          <div>
            <p className="text-xs text-muted-foreground">Placa</p>
            <p className="text-sm font-semibold">
              {orderQuotation.vehicle?.plate || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">VIN</p>
            <p className="text-sm font-medium">
              {orderQuotation.vehicle?.vin || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Marca</p>
            <p className="text-sm font-medium">
              {orderQuotation.vehicle?.model?.brand || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Modelo</p>
            <p className="text-sm font-medium">
              {orderQuotation.vehicle?.model?.version || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Año</p>
            <p className="text-sm font-medium">
              {orderQuotation.vehicle?.year || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Color</p>
            <p className="text-sm font-medium">
              {orderQuotation.vehicle?.vehicle_color || "N/A"}
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Información de la Cotización */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Información de la Cotización</h3>
        <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
          <div>
            <p className="text-xs text-muted-foreground">
              Número de Cotización
            </p>
            <p className="text-sm font-semibold">
              {orderQuotation.quotation_number}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Fecha Cotización</p>
            <p className="text-sm font-medium">
              {orderQuotation.quotation_date
                ? new Date(orderQuotation.quotation_date).toLocaleDateString(
                    "es-PE",
                    {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    },
                  )
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Fecha Vencimiento</p>
            <p className="text-sm font-medium">
              {orderQuotation.expiration_date
                ? new Date(orderQuotation.expiration_date).toLocaleDateString(
                    "es-PE",
                    {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    },
                  )
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Moneda</p>
            <Badge variant="outline">
              {orderQuotation.type_currency?.name || "N/A"}
            </Badge>
          </div>
          {orderQuotation.observations && (
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground">Observaciones</p>
              <p className="text-sm font-medium">
                {orderQuotation.observations}
              </p>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Detalle de Productos/Repuestos */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Detalle de Productos</h3>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-left">Código</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-center">Cantidad</TableHead>
                <TableHead className="text-right">P. Unitario</TableHead>
                <TableHead className="text-right">% Dto.</TableHead>
                <TableHead className="text-right">Neto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderQuotation.details?.map((detail) => (
                <TableRow key={detail.id}>
                  <TableCell>
                    <div className="text-sm">{detail.product!.code}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{detail.description}</div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="text-sm">
                      {detail.quantity} {detail.unit_measure}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="text-sm font-medium">
                      {currencySymbol}{" "}
                      {Number(detail.unit_price).toLocaleString("es-PE", {
                        minimumFractionDigits: 2,
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="text-sm font-medium">
                      {Number(detail.discount_percentage).toLocaleString(
                        "es-PE",
                        {
                          minimumFractionDigits: 2,
                        },
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="text-sm font-semibold">
                      {currencySymbol}{" "}
                      {Number(detail.total_amount).toLocaleString("es-PE", {
                        minimumFractionDigits: 2,
                      })}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Totales de la Cotización */}
        <div className="space-y-2 bg-muted/30 p-4 rounded-lg">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">
              {currencySymbol}{" "}
              {orderQuotation.subtotal.toLocaleString("es-PE", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Descuento</span>
            <span className="font-medium">
              {currencySymbol}{" "}
              {orderQuotation.discount_amount.toLocaleString("es-PE", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">OP. Gravadas</span>
            <span className="font-medium">
              {currencySymbol}{" "}
              {orderQuotation.op_gravada.toLocaleString("es-PE", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">IGV (18%)</span>
            <span className="font-medium">
              {currencySymbol}{" "}
              {(
                orderQuotation.total_amount -
                orderQuotation.subtotal +
                (orderQuotation.discount_amount || 0)
              ).toLocaleString("es-PE", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between text-base font-bold text-primary">
            <span>Total</span>
            <span>
              {currencySymbol}{" "}
              {orderQuotation.total_amount.toLocaleString("es-PE", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Facturas y Anticipos */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">
            Documentos Electrónicos ({advances.length})
          </h3>
          {hasAdvances && (
            <Badge variant="outline" className="text-sm">
              Total Anticipos: {currencySymbol}{" "}
              {totalAdvances.toLocaleString("es-PE", {
                minimumFractionDigits: 2,
              })}
            </Badge>
          )}
        </div>

        {!hasAdvances ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-sm">
              No hay facturas o anticipos asociados a esta cotización
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Documento</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Fecha Emisión</TableHead>
                    <TableHead>Observaciones</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {advances.map((doc) => {
                    const config =
                      statusConfig[doc.status as keyof typeof statusConfig];
                    const StatusIcon = config?.icon || FileText;

                    return (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div className="font-medium">
                            {doc.serie}-{String(doc.numero).padStart(8, "0")}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {doc.full_number}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {doc.document_type?.description || "N/A"}
                          </div>
                          {doc.is_advance_payment && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              Anticipo
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">
                            {doc.cliente_denominacion}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {doc.cliente_numero_de_documento}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(doc.fecha_de_emision).toLocaleDateString(
                              "es-PE",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              },
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground max-w-[200px]">
                            {doc.observaciones || "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${config?.className} flex items-center gap-1 w-fit`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            <span>{config?.label}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-semibold w-20">
                            {currencySymbol}{" "}
                            {doc.total.toLocaleString("es-PE", {
                              minimumFractionDigits: 2,
                            })}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Resumen de Totales */}
            <div className="space-y-2 bg-primary/5 p-4 rounded-lg border border-primary/20">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Cotización</span>
                <span className="font-medium">
                  {currencySymbol}{" "}
                  {orderQuotation.total_amount.toLocaleString("es-PE", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Anticipos</span>
                <span className="font-medium">
                  {currencySymbol}{" "}
                  {totalAdvances.toLocaleString("es-PE", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-base font-bold text-primary">
                <span>Saldo Pendiente</span>
                <span>
                  {currencySymbol}{" "}
                  {(orderQuotation.total_amount - totalAdvances).toLocaleString(
                    "es-PE",
                    {
                      minimumFractionDigits: 2,
                    },
                  )}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Estado SUNAT */}
      {hasAdvances && (
        <>
          <Separator />
          <div className="space-y-3">
            <h3 className="font-semibold">Estado SUNAT de Documentos</h3>
            <div className="space-y-2">
              {advances.map((doc) => (
                <div key={doc.id} className="bg-muted/30 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      {doc.serie}-{String(doc.numero).padStart(8, "0")}
                    </span>
                    <div className="flex items-center gap-2">
                      {doc.aceptada_por_sunat === true ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-xs font-medium text-green-600">
                            Aceptado por SUNAT
                          </span>
                        </>
                      ) : doc.aceptada_por_sunat === false ? (
                        <>
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span className="text-xs font-medium text-red-600">
                            Rechazado por SUNAT
                          </span>
                        </>
                      ) : (
                        <>
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            Pendiente de envío
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  {doc.sunat_description && (
                    <p className="text-xs text-muted-foreground">
                      {doc.sunat_description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Sección de Firma del Cliente */}
      {shouldShowSignature && (
        <>
          <Separator />
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmitSignature)}
              className="space-y-4"
            >
              <GroupFormSection
                title="Firma de Conformidad del Cliente"
                icon={PenLine}
                iconColor="text-primary"
                bgColor="bg-blue-50"
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
    </div>
  );
}
