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
      title="Salida de Inventario"
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
  const alreadyDelivered = orderQuotation.output_generation_warehouse;

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
      successToast("Salida de inventario generada correctamente");
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
          <h3 className="font-semibold text-lg">Datos de Recepción</h3>
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <IdCard className="h-3 w-3" /> DNI del Receptor
              </p>
              <p className="text-sm font-semibold">
                {orderQuotation.delivery_document_number || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <PenLine className="h-3 w-3" /> Firma del Receptor
              </p>
              {orderQuotation.customer_signature_delivery_url ? (
                <SignaturePad
                  label="Firma del Receptor"
                  value={orderQuotation.customer_signature_delivery_url}
                  onChange={() => {}}
                  disabled
                />
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No hay firma registrada
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <GroupFormSection
              title="Datos del Receptor"
              icon={IdCard}
              iconColor="text-primary"
              bgColor="bg-blue-50"
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
              iconColor="text-primary"
              bgColor="bg-blue-50"
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
                disabled={
                  deliverMutation.isPending || !form.formState.isValid
                }
              >
                {deliverMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {deliverMutation.isPending
                  ? "Generando salida..."
                  : "Confirmar Salida de Inventario"}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
