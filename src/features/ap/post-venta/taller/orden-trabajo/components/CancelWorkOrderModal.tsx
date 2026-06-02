import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loader } from "lucide-react";
import { errorToast, successToast } from "@/core/core.function";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormTextArea } from "@/shared/components/FormTextArea";
import { useAllReasonDiscardingTaller } from "@/features/ap/configuraciones/postventa/motivos-descarte-taller/lib/reasonDiscardingTaller.hook";
import { cancelWorkOrder } from "../lib/workOrder.actions";
import { WORKER_ORDER } from "../lib/workOrder.constants";
import { GeneralModal } from "@/shared/components/GeneralModal";

const cancelWorkOrderSchema = z.object({
  discard_reason_id: z.string().min(1, "El motivo es requerido"),
  discarded_note: z.string().optional(),
});

type CancelWorkOrderSchema = z.infer<typeof cancelWorkOrderSchema>;

interface CancelWorkOrderModalProps {
  open: boolean;
  onClose: () => void;
  workOrderId: number;
  onSuccess?: () => void;
}

export const CancelWorkOrderModal = ({
  open,
  onClose,
  workOrderId,
  onSuccess,
}: CancelWorkOrderModalProps) => {
  const queryClient = useQueryClient();
  const { data: reasons = [], isLoading: loadingReasons } =
    useAllReasonDiscardingTaller();

  const form = useForm<CancelWorkOrderSchema>({
    resolver: zodResolver(cancelWorkOrderSchema),
    defaultValues: {
      discard_reason_id: "",
      discarded_note: "",
    },
  });

  const { mutate: cancel, isPending } = useMutation({
    mutationFn: async (data: CancelWorkOrderSchema) => {
      return await cancelWorkOrder(workOrderId, {
        discard_reason_id: Number(data.discard_reason_id),
        discarded_note: data.discarded_note || null,
      });
    },
    onSuccess: () => {
      successToast("Orden de trabajo cancelada correctamente");
      queryClient.invalidateQueries({ queryKey: [WORKER_ORDER.QUERY_KEY] });
      onSuccess?.();
      form.reset();
      onClose();
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        "Error al cancelar la orden de trabajo";
      errorToast(message);
    },
  });

  const handleSubmit = (data: CancelWorkOrderSchema) => {
    cancel(data);
  };

  const handleCancel = () => {
    form.reset();
    onClose();
  };

  return (
    <GeneralModal
      open={open}
      onClose={handleCancel}
      title="Cancelar Orden de Trabajo"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormSelect
            control={form.control}
            name="discard_reason_id"
            label="Motivo de Descarte"
            placeholder="Seleccione un motivo"
            options={reasons.map((reason) => ({
              label: reason.description,
              value: reason.id.toString(),
            }))}
            required
            disabled={loadingReasons}
          />

          <FormTextArea
            control={form.control}
            name="discarded_note"
            label="Notas (Opcional)"
            placeholder="Agregar notas adicionales..."
            rows={3}
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
              {isPending ? "Cancelando..." : "Cancelar Orden"}
            </Button>
          </div>
        </form>
      </Form>
    </GeneralModal>
  );
};
