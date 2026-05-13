import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
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
import { FormTextArea } from "@/shared/components/FormTextArea";
import { discardSupplierOrder } from "../lib/supplierOrder.actions";
import { SUPPLIER_ORDER } from "../lib/supplierOrder.constants";

const discardSupplierOrderSchema = z.object({
  reason_cancellation: z.string().min(1, "El motivo es requerido"),
});

type DiscardSupplierOrderSchema = z.infer<typeof discardSupplierOrderSchema>;

interface DiscardSupplierOrderModalProps {
  open: boolean;
  onClose: () => void;
  supplierOrderId: number;
  onSuccess?: () => void;
}

export const DiscardSupplierOrderModal = ({
  open,
  onClose,
  supplierOrderId,
  onSuccess,
}: DiscardSupplierOrderModalProps) => {
  const queryClient = useQueryClient();

  const form = useForm<DiscardSupplierOrderSchema>({
    resolver: zodResolver(discardSupplierOrderSchema),
    defaultValues: {
      reason_cancellation: "",
    },
  });

  const { mutate: discard, isPending } = useMutation({
    mutationFn: (data: DiscardSupplierOrderSchema) =>
      discardSupplierOrder(supplierOrderId, data),
    onSuccess: () => {
      successToast("Orden de compra descartada correctamente");
      queryClient.invalidateQueries({ queryKey: [SUPPLIER_ORDER.QUERY_KEY] });
      onSuccess?.();
      form.reset();
      onClose();
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Error al descartar la orden de compra";
      errorToast(message);
    },
  });

  const handleCancel = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Descartar Orden de Compra</DialogTitle>
          <DialogDescription>
            Ingrese el motivo por el cual desea descartar esta orden de compra.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => discard(data))}
            className="space-y-4"
          >
            <FormTextArea
              control={form.control}
              name="reason_cancellation"
              label="Motivo de Cancelación"
              placeholder="Ingrese el motivo..."
              rows={3}
              required
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isPending || !form.formState.isValid}
                variant="destructive"
              >
                {isPending && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? "Descartando..." : "Descartar Orden"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
