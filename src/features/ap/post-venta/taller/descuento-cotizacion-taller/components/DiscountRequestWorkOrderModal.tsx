import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
  storeDiscountRequestWorkOrderQuotation,
  updateDiscountRequestWorkOrderQuotation,
} from "../lib/discountRequestTaller.actions";
import {
  DISCOUNT_REQUEST_TALLER,
  TYPE_GLOBAL,
  TYPE_PARTIAL,
} from "../lib/discountRequestTaller.constants";
import { DiscountRequestWorkOrderQuotationResource } from "../lib/discountRequestTaller.interface";

const schema = z.object({
  type: z.enum(["GLOBAL", "PARTIAL"]),
  requested_discount_percentage: z
    .number({ error: "Ingrese un porcentaje válido" })
    .min(0, "Mínimo 0%")
    .max(100, "Máximo 100%"),
  requested_discount_amount: z
    .number({ error: "Ingrese un monto válido" })
    .min(0, "Debe ser mayor o igual a 0"),
  item_type: z.enum(["PART", "LABOUR"]),
});

type FormSchema = z.infer<typeof schema>;

interface DiscountRequestWorkOrderModalProps {
  open: boolean;
  onClose: () => void;
  type: "GLOBAL" | "PARTIAL";
  workOrderId: number;
  baseAmount: number;
  /** Para descuento parcial: id del part/labour */
  partLabourId?: number;
  /** Para descuento parcial: MODEL_PART | MODEL_LABOUR */
  partLabourModel?: string;
  /** Descripción del item para mostrar en el modal */
  itemDescription?: string;
  currencySymbol?: string;
  existingRequest?: DiscountRequestWorkOrderQuotationResource;
  itemType: "PART" | "LABOUR";
  onSuccess?: () => void;
}

export const DiscountRequestWorkOrderModal = ({
  open,
  onClose,
  type,
  workOrderId,
  baseAmount,
  partLabourId,
  partLabourModel,
  itemDescription,
  currencySymbol = "S/.",
  existingRequest,
  itemType,
  onSuccess,
}: DiscountRequestWorkOrderModalProps) => {
  const queryClient = useQueryClient();
  const isEditing = !!existingRequest;

  const form = useForm<FormSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      type,
      requested_discount_percentage: existingRequest
        ? Number(existingRequest.requested_discount_percentage)
        : 0,
      requested_discount_amount: 0,
      item_type: itemType,
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      type,
      requested_discount_percentage: existingRequest
        ? Number(existingRequest.requested_discount_percentage)
        : 0,
      requested_discount_amount: 0,
      item_type: itemType,
    });
  }, [open, type, existingRequest, form, itemType]);

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
    mutationFn: (data: FormSchema) => {
      const payload = {
        type: data.type,
        requested_discount_percentage: data.requested_discount_percentage,
        requested_discount_amount: computedDiscountMonto,
        item_type: data.item_type,
        ap_work_order_id: workOrderId,
        part_labour_model:
          type === TYPE_PARTIAL ? partLabourModel : data.item_type,
        ...(type === TYPE_PARTIAL && partLabourId !== undefined
          ? { part_labour_id: partLabourId }
          : {}),
      };
      return isEditing
        ? updateDiscountRequestWorkOrderQuotation(existingRequest!.id, payload)
        : storeDiscountRequestWorkOrderQuotation(payload);
    },
    onSuccess: () => {
      successToast(
        isEditing
          ? "Solicitud actualizada correctamente"
          : "Solicitud de descuento enviada correctamente",
      );
      queryClient.invalidateQueries({
        queryKey: [
          DISCOUNT_REQUEST_TALLER.QUERY_KEY,
          "work-order",
          workOrderId,
        ],
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

  const handleSubmit = (data: FormSchema) => {
    submitRequest(data);
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
    ? "Se aplicará un descuento sobre el total de la orden de trabajo."
    : `Descuento sobre el ítem: ${itemDescription ?? ""}`;

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
            <div className="rounded-md border bg-muted/40 p-3 text-sm space-y-1">
              {!isGlobal && itemDescription && (
                <p className="font-medium">{itemDescription}</p>
              )}
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Monto base</span>
                <span className="font-medium text-foreground">
                  {currencySymbol} {baseAmount.toFixed(2)}
                </span>
              </div>
            </div>

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
