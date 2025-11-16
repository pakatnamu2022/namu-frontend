import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { GeneralModal } from "@/shared/components/GeneralModal";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { ApSafeCreditGoalForm } from "./ApSafeCreditGoalForm";
import { AP_SAFE_CREDIT_GOAL } from "../lib/apSafeCreditGoal.constants";
import { useApSafeCreditGoalById } from "../lib/apSafeCreditGoal.hook";
import { ApSafeCreditGoalResource } from "../lib/apSafeCreditGoal.interface";
import { ApSafeCreditGoalSchema } from "../lib/apSafeCreditGoal.schema";
import {
  storeApSafeCreditGoal,
  updateApSafeCreditGoal,
} from "../lib/apSafeCreditGoal.actions";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
  mode: "create" | "update";
}

export default function ApSafeCreditGoalModal({
  id,
  open,
  onClose,
  title,
  mode,
}: Props) {
  const queryClient = useQueryClient();
  const { EMPTY, MODEL, QUERY_KEY } = AP_SAFE_CREDIT_GOAL;
  const {
    data: ApSafeCreditGoal,
    isLoading: loadingApSafeCreditGoal,
    refetch,
  } = mode === "create"
    ? { data: EMPTY, isLoading: false, refetch: () => {} }
    : useApSafeCreditGoalById(id!);

  function mapRoleToForm(
    data: ApSafeCreditGoalResource
  ): Partial<ApSafeCreditGoalSchema> {
    return {
      year: data.year,
      month: data.month,
      goal_amount: data.goal_amount,
      sede_id: String(data.sede_id),
      type: data.type,
    };
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ApSafeCreditGoalSchema) =>
      mode === "create"
        ? storeApSafeCreditGoal(data)
        : updateApSafeCreditGoal(id!, data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, mode));
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY],
      });
      await refetch();
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message, ERROR_MESSAGE(MODEL, mode));
    },
  });

  const handleSubmit = (data: ApSafeCreditGoalSchema) => {
    mutate({
      ...data,
    } as any);

    onClose();
  };

  const isLoadingAny = loadingApSafeCreditGoal || !ApSafeCreditGoal;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && ApSafeCreditGoal ? (
        <ApSafeCreditGoalForm
          defaultValues={mapRoleToForm(ApSafeCreditGoal)}
          onCancel={onClose}
          onSubmit={handleSubmit}
          isSubmitting={isPending}
          mode={mode}
        />
      ) : (
        <FormSkeleton />
      )}
    </GeneralModal>
  );
}
