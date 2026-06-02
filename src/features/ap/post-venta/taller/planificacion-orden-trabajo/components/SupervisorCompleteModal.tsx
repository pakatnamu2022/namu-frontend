import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { DateTimePickerForm } from "@/shared/components/DateTimePickerForm";
import { formatDateTimeLocalInput } from "@/core/core.function";
import { errorToast, successToast } from "@/core/core.function";
import { supervisorComplete } from "../lib/workOrderPlanning.actions";
import { WORK_ORDER_PLANNING } from "../lib/workOrderPlanning.constants";

const supervisorCompleteSchema = z.object({
  end_datetime: z.string().min(1, "La fecha y hora de finalización es requerida"),
});

type SupervisorCompleteSchema = z.infer<typeof supervisorCompleteSchema>;

interface SupervisorCompleteModalProps {
  open: boolean;
  onClose: () => void;
  workOrderPlanningId: number;
  dateOrderWorkPlanning: Date;
  onSuccess?: () => void;
}

export const SupervisorCompleteModal = ({
  open,
  onClose,
  workOrderPlanningId,
  dateOrderWorkPlanning,
  onSuccess,
}: SupervisorCompleteModalProps) => {
  const queryClient = useQueryClient();

  const form = useForm<SupervisorCompleteSchema>({
    resolver: zodResolver(supervisorCompleteSchema),
    defaultValues: {
      end_datetime: formatDateTimeLocalInput(dateOrderWorkPlanning) || "",
    },
  });

  const { mutate: complete, isPending } = useMutation({
    mutationFn: async (data: SupervisorCompleteSchema) => {
      return await supervisorComplete(workOrderPlanningId, data.end_datetime);
    },
    onSuccess: () => {
      successToast("Trabajo finalizado correctamente por el supervisor");
      queryClient.invalidateQueries({
        queryKey: [WORK_ORDER_PLANNING.QUERY_KEY],
      });
      onSuccess?.();
      form.reset();
      onClose();
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Error al finalizar el trabajo";
      errorToast(message);
    },
  });

  const handleSubmit = (data: SupervisorCompleteSchema) => {
    complete(data);
  };

  const handleClose = () => {
    form.reset({
      end_datetime: formatDateTimeLocalInput(dateOrderWorkPlanning) || "",
    });
    onClose();
  };

  return (
    <GeneralModal
      open={open}
      onClose={handleClose}
      title="Finalizar como Supervisor"
      icon="ShieldCheck"
      size="md"
    >
      <Form {...form}>
        <form
          id="supervisor-complete-form"
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4"
        >
          <DateTimePickerForm
            control={form.control}
            name="end_datetime"
            label="Hora de finalización"
            placeholder="Seleccione fecha y hora"
            disabledRange={{ before: dateOrderWorkPlanning || new Date() }}
          />

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="supervisor-complete-form"
              disabled={isPending || !form.formState.isValid}
              className="gap-2"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirmar
            </Button>
          </div>
        </form>
      </Form>
    </GeneralModal>
  );
};
