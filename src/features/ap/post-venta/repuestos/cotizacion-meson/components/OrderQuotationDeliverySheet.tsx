import GeneralSheet from "@/shared/components/GeneralSheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { FileText, Loader2, PenLine, IdCard } from "lucide-react";
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
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { SignaturePad } from "../../../taller/inspeccion-vehiculo/components/SignaturePad";
import { deliverInventoryOutput } from "../lib/quotationMeson.actions";
import { errorToast, successToast } from "@/core/core.function";

interface OrderQuotationDeliverySheetProps {
  orderQuotationId: number | null;
  open: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

export function OrderQuotationDeliverySheet({
  orderQuotationId,
  open,
  onClose,
  onRefresh,
}: OrderQuotationDeliverySheetProps) {
  const { data: orderQuotation, isLoading } = useQuery({
    queryKey: ["orderQuotationDelivery", orderQuotationId],
    queryFn: () => findOrderQuotationById(orderQuotationId!),
    enabled: open && orderQuotationId !== null,
  });

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title="Entrega de Repuestos"
      subtitle={
        orderQuotation
          ? `Cotización ${orderQuotation.quotation_number}`
          : "Cargando..."
      }
      icon="PackageOpen"
      size="3xl"
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
        <DeliverySheetContent
          orderQuotation={orderQuotation}
          onRefresh={onRefresh}
        />
      )}
    </GeneralSheet>
  );
}

interface DeliverySheetContentProps {
  orderQuotation: OrderQuotationResource;
  onRefresh?: () => void;
}

const deliverySchema = z.object({
  customer_signature_delivery_url: z
    .string()
    .min(1, "La firma del receptor es requerida"),
  delivery_document_number: z
    .string()
    .min(1, "El DNI del receptor es requerido"),
});

type DeliveryFormData = z.infer<typeof deliverySchema>;

function DeliverySheetContent({
  orderQuotation,
  onRefresh,
}: DeliverySheetContentProps) {
  const queryClient = useQueryClient();
  const currencySymbol = orderQuotation.type_currency?.symbol || "S/.";
  const alreadyDelivered =
    orderQuotation.delivery_document_number &&
    orderQuotation.delivery_document_number.trim() !== "" &&
    orderQuotation.customer_signature_delivery_url &&
    orderQuotation.customer_signature_delivery_url.trim() !== "";

  const form = useForm<DeliveryFormData>({
    resolver: zodResolver(deliverySchema),
    defaultValues: {
      customer_signature_delivery_url: "",
      delivery_document_number: "",
    },
  });

  const deliverMutation = useMutation({
    mutationFn: (data: DeliveryFormData) =>
      deliverInventoryOutput(orderQuotation.id, data),
    onSuccess: () => {
      successToast("Entrega generada correctamente");
      queryClient.invalidateQueries({
        queryKey: ["orderQuotationDelivery", orderQuotation.id],
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
          "Error al generar la salida de inventario. Intente nuevamente.",
      );
    },
  });

  const onSubmit = (data: DeliveryFormData) => {
    deliverMutation.mutate(data);
  };

  return (
    <div className="space-y-6 px-6">
      {/* Detalle de Repuestos */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Repuestos a Entregar</h3>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-left">Código</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-center">Cantidad</TableHead>
                <TableHead className="text-right">P. Unitario</TableHead>
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

        <div className="flex justify-end text-base font-bold text-primary bg-muted/30 p-3 rounded-lg">
          <span className="mr-4">Total:</span>
          <span>
            {currencySymbol}{" "}
            {orderQuotation.total_amount.toLocaleString("es-PE", {
              minimumFractionDigits: 2,
            })}
          </span>
        </div>
      </div>

      <Separator />

      {/* Sección de firma y DNI */}
      {alreadyDelivered ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Datos de Recepción</h3>
            <div className="flex items-center gap-2 bg-blue-100 px-3 py-1.5 rounded-md">
              <IdCard className="h-4 w-4 text-blue-700" />
              <div className="text-right">
                <p className="text-[10px] text-blue-600 font-medium">DNI</p>
                <p className="text-sm font-bold text-blue-900">
                  {orderQuotation.delivery_document_number || "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-linear-to-br from-slate-50 to-slate-100/50 border border-slate-200 p-5 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-slate-600 rounded-lg">
                <PenLine className="h-4 w-4 text-white" />
              </div>
              <p className="text-sm text-slate-700 font-medium">
                Firma del Receptor
              </p>
            </div>
            {orderQuotation.customer_signature_delivery_url ? (
              <div className="flex justify-center items-center bg-white border-2 border-dashed border-slate-300 rounded-lg p-4 min-h-[120px]">
                <img
                  src={orderQuotation.customer_signature_delivery_url}
                  alt="Firma del receptor"
                  className="h-24 w-auto object-contain"
                  style={{ imageRendering: "auto" }}
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic text-center py-10">
                No hay firma registrada
              </p>
            )}
          </div>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <GroupFormSection
              title="Datos del Receptor"
              icon={IdCard}
              color="blue"
              cols={{ sm: 1 }}
            >
              <FormField
                control={form.control}
                name="delivery_document_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DNI del Receptor</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ingrese el DNI"
                        disabled={deliverMutation.isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </GroupFormSection>

            <GroupFormSection
              title="Firma de Recepción"
              icon={PenLine}
              color="blue"
              cols={{ sm: 1 }}
            >
              <FormField
                control={form.control}
                name="customer_signature_delivery_url"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <SignaturePad
                        label="Firma del Receptor"
                        value={field.value}
                        onChange={field.onChange}
                        disabled={deliverMutation.isPending}
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
                disabled={deliverMutation.isPending || !form.formState.isValid}
              >
                {deliverMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {deliverMutation.isPending
                  ? "Generando entrega..."
                  : "Confirmar Entrega"}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
