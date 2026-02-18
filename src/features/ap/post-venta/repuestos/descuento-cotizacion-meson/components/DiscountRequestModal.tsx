import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loader } from "lucide-react";
import { errorToast, successToast } from "@/core/core.function";
import { FormInput } from "@/shared/components/FormInput";
import {
  discountRequestSchema,
  DiscountRequestSchema,
} from "../lib/discountRequestMeson.schema";
import {
  storeDiscountRequestOrderQuotation,
  updateDiscountRequestOrderQuotation,
} from "../lib/discountRequestMeson.actions";
import {
  DISCOUNT_REQUEST_MESON,
  TYPE_GLOBAL,
  TYPE_PARTIAL,
} from "../lib/discountRequestMeson.constants";
import { OrderQuotationDetailsResource } from "@/features/ap/post-venta/taller/cotizacion-detalle/lib/proformaDetails.interface";
import { DiscountRequestOrderQuotationResource } from "../lib/discountRequestMeson.interface";

interface DiscountRequestModalProps {
  open: boolean;
  onClose: () => void;
  type: "GLOBAL" | "PARTIAL";
  quotationId: number;
  /** Monto base: total del ítem (PARTIAL) o suma total de ítems (GLOBAL) */
  baseAmount: number;
  detail?: OrderQuotationDetailsResource;
  currencySymbol?: string;
  /** Si se pasa, el modal trabaja en modo edición */
  existingRequest?: DiscountRequestOrderQuotationResource;
  onSuccess?: () => void;
  /** Tipo de ítem al que aplica el descuento */
  itemType?: "PRODUCT" | "LABOR";
}

export const DiscountRequestModal = ({
  open,
  onClose,
  type,
  quotationId,
  baseAmount,
  detail,
  currencySymbol = "S/.",
  existingRequest,
  onSuccess,
  itemType = "PRODUCT",
}: DiscountRequestModalProps) => {
  const queryClient = useQueryClient();
  const isEditing = !!existingRequest;

  const form = useForm<DiscountRequestSchema>({
    resolver: zodResolver(discountRequestSchema),
    defaultValues: {
      type,
      requested_discount_percentage: existingRequest
        ? Number(existingRequest.requested_discount_percentage)
        : 0,
      requested_discount_amount: existingRequest
        ? Number(existingRequest.requested_discount_amount)
        : 0,
      ap_order_quotation_id: type === TYPE_GLOBAL ? quotationId : null,
      ap_order_quotation_detail_id:
        type === TYPE_PARTIAL && detail ? detail.id : null,
      item_type: existingRequest?.item_type ?? itemType,
    },
  });

  useEffect(() => {
    if (!open) return;
    const resetValues = {
      type,
      requested_discount_percentage: existingRequest
        ? Number(existingRequest.requested_discount_percentage)
        : 0,
      requested_discount_amount: existingRequest
        ? Number(existingRequest.requested_discount_amount)
        : 0,
      ap_order_quotation_id: type === TYPE_GLOBAL ? quotationId : null,
      ap_order_quotation_detail_id:
        type === TYPE_PARTIAL && detail ? detail.id : null,
      item_type: existingRequest?.item_type ?? itemType,
    };
    form.reset(resetValues);
  }, [detail, existingRequest, form, itemType, open, quotationId, type]);

  const discountPercentage = useWatch({
    control: form.control,
    name: "requested_discount_percentage",
  });

  const pct = Number(discountPercentage || 0);
  const computedDiscountMonto = parseFloat(
    ((baseAmount * pct) / 100).toFixed(2),
  );
  const totalConDescuento = baseAmount - computedDiscountMonto;

  const { mutate: submitRequest, isPending } = useMutation({
    mutationFn: (data: DiscountRequestSchema) =>
      isEditing
        ? updateDiscountRequestOrderQuotation(existingRequest!.id, {
            ...data,
            requested_discount_amount: computedDiscountMonto,
          })
        : storeDiscountRequestOrderQuotation({
            ...data,
            requested_discount_amount: computedDiscountMonto,
          }),
    onSuccess: () => {
      successToast(
        isEditing
          ? "Solicitud actualizada correctamente"
          : "Solicitud de descuento enviada correctamente",
      );
      queryClient.invalidateQueries({
        queryKey: [DISCOUNT_REQUEST_MESON.QUERY_KEY],
      });
      onSuccess?.();
      form.reset();
      onClose();
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        "Error al procesar la solicitud de descuento";
      errorToast(message);
    },
  });

  const handleSubmit = (data: DiscountRequestSchema) => {
    const payload = { ...data, item_type: itemType };
    submitRequest(payload);
  };

  const handleCancel = () => {
    form.reset();
    onClose();
  };

  const isGlobal = type === TYPE_GLOBAL;
  const title = isEditing
    ? isGlobal
      ? "Editar Descuento Global"
      : "Editar Descuento Parcial"
    : isGlobal
      ? "Solicitar Descuento Global"
      : "Solicitar Descuento Parcial";
  const description = isGlobal
    ? "Se aplicará un descuento sobre el total de la cotización."
    : `Descuento sobre el ítem: ${detail?.description ?? ""}`;

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Info base */}
            <div className="rounded-md border bg-muted/40 p-3 text-sm space-y-1">
              {!isGlobal && detail && (
                <p className="font-medium">{detail.description}</p>
              )}
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Monto base</span>
                <span className="font-medium text-foreground">
                  {currencySymbol} {baseAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Porcentaje — único campo editable */}
            <FormInput
              control={form.control}
              name="requested_discount_percentage"
              label="Porcentaje de descuento solicitado"
              type="number"
              min={0}
              max={100}
              step={0.01}
              addonEnd={<span className="text-xs font-medium">%</span>}
              required
            />

            {/* Monto — solo referencia visual, calculado del porcentaje */}
            <div className="flex flex-col gap-1">
              <label className="text-xs md:text-sm font-medium leading-none">
                Monto de descuento solicitado
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground z-10">
                  {currencySymbol}
                </div>
                <div className="h-8 md:h-10 w-full rounded-md border bg-muted pl-10 pr-3 flex items-center text-xs md:text-sm text-muted-foreground cursor-not-allowed select-none">
                  {computedDiscountMonto.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Resultado con descuento */}
            <div className="rounded-md border bg-muted/40 p-3 text-sm space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Descuento</span>
                <span className="text-destructive font-medium">
                  - {currencySymbol} {computedDiscountMonto.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-semibold">
                <span>Total con descuento</span>
                <span>
                  {currencySymbol} {totalConDescuento.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                {isPending
                  ? "Guardando..."
                  : isEditing
                    ? "Actualizar solicitud"
                    : "Solicitar descuento"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
