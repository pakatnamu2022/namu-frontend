import {
  errorToast,
  formatDateTimeLocalInput,
  successToast,
} from "@/core/core.function";
import { requiredText } from "@/shared/lib/global.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { cancelPlanning } from "../lib/workOrderPlanning.actions";
import { WORK_ORDER_PLANNING } from "../lib/workOrderPlanning.constants";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { Form } from "@/components/ui/form";
import { FormTextArea } from "@/shared/components/FormTextArea";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { DateTimePickerForm } from "@/shared/components/DateTimePickerForm";

const cancelWorkOrderPlanningSchema = z.object({
  actual_end_datetime: z
    .string()
    .min(1, "La fecha y hora de finalización es requerida"),
  canceled_note: requiredText("La nota de cancelación es requerida", 1, 250),
});

type CancelWorkOrderPlanningSchema = z.infer<
  typeof cancelWorkOrderPlanningSchema
>;

interface CancelWorkOrderModalProps {
  open: boolean;
  onClose: () => void;
  workOrderPlanningId: number;
  dateOrderWorkPlanning: Date;
  onSuccess?: () => void;
}

export const CancelWorkOrderPlanningModal = ({
  open,
  onClose,
  workOrderPlanningId,
  dateOrderWorkPlanning,
  onSuccess,
}: CancelWorkOrderModalProps) => {
  const queryClient = useQueryClient();

  const form = useForm<CancelWorkOrderPlanningSchema>({
    resolver: zodResolver(cancelWorkOrderPlanningSchema),
    defaultValues: {
      actual_end_datetime:
        formatDateTimeLocalInput(dateOrderWorkPlanning) || "",
      canceled_note: "",
    },
  });

  const { mutate: cancel, isPending } = useMutation({
    mutationFn: async (data: CancelWorkOrderPlanningSchema) => {
      return await cancelPlanning(workOrderPlanningId, {
        actual_end_datetime: data.actual_end_datetime || "",
        canceled_note: data.canceled_note || "",
      });
    },
    onSuccess: () => {
      successToast("Planificación cancelada correctamente");
      queryClient.invalidateQueries({
        queryKey: [WORK_ORDER_PLANNING.QUERY_KEY],
      });
      onSuccess?.();
      form.reset();
      onClose();
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Error al cancelar la planificación";
      errorToast(message);
    },
  });

  const handleSubmit = (data: CancelWorkOrderPlanningSchema) => {
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
      title="Cancelar Planificación"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <DateTimePickerForm
            name="actual_end_datetime"
            label="Fecha y Hora de Finalización"
            control={form.control}
            placeholder="Seleccione fecha y hora"
            disabledRange={{ before: dateOrderWorkPlanning || new Date() }}
          />

          <FormTextArea
            control={form.control}
            name="canceled_note"
            label="Nota de cancelación"
            placeholder="Agregar nota de cancelación"
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
