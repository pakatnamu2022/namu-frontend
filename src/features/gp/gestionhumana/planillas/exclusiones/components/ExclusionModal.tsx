import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { ExclusionForm } from "./ExclusionForm";
import { storeExclusion } from "../lib/exclusion.actions";
import { useAllWorkers } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import { useAllPayrollPeriods } from "@/features/gp/gestionhumana/planillas/periodo-planilla/lib/payroll-period.hook";
import { PAYROLL_EXCLUSION } from "../lib/exclusion.constants";
import { ExclusionCreateSchema } from "../lib/exclusion.schema";

const { MODEL, QUERY_KEY } = PAYROLL_EXCLUSION;

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
}

export default function ExclusionModal({ open, onClose, title }: Props) {
  const queryClient = useQueryClient();

  const { data: workers, isLoading: isLoadingWorkers } = useAllWorkers(
    { status_id: 22 },
    open,
  );

  const { data: periods, isLoading: isLoadingPeriods } = useAllPayrollPeriods();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ExclusionCreateSchema) =>
      storeExclusion({
        worker_id: Number(data.worker_id),
        period_id: Number(data.period_id),
        concept: data.concept as string,
        reason: data.reason || undefined,
      }),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message,
        ERROR_MESSAGE(MODEL, "create"),
      );
    },
  });

  const handleSubmit = (data: ExclusionCreateSchema) => {
    mutate(data);
    onClose();
  };

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      <ExclusionForm
        defaultValues={{}}
        workers={isLoadingWorkers ? [] : workers}
        periods={isLoadingPeriods ? [] : periods}
        onCancel={onClose}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
      />
    </GeneralModal>
  );
}
