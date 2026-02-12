import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GOALTRAVELCONTROL } from "../lib/GoalTravelControl.constants";
import { useGoalTravelById } from "../lib/GoalTravelControl.hook";
import { GoalTravelControlResource } from "../lib/GoalTravelControl.interface";
import { GoalTravelSchema } from "../lib/GoalTravelControl.schema";
import {
  storeGoalTravel,
  updateGoalTravel,
} from "../lib/GoalTravelControl.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { GeneralModal } from "@/shared/components/GeneralModal";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { GoalTravelForm } from "./GoalTravelForm";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
  mode: "create" | "update";
}

export default function GoalTravelModal({
  id,
  open,
  onClose,
  title,
  mode,
}: Props) {
  const { EMPTY, MODEL, QUERY_KEY } = GOALTRAVELCONTROL;
  const queryClient = useQueryClient();

  const {
    data: goal,
    isLoading: loadingGoal,
    refetch,
  } = mode === "create"
    ? { data: EMPTY, isLoading: false, refetch: () => {} }
    : useGoalTravelById(id!);

  function mapGoalTravelToFrom(
    data: GoalTravelControlResource,
  ): Partial<GoalTravelSchema> {
    return {
      date:
        typeof data.date === "string"
          ? data.date
          : data.date instanceof Date
            ? data.date.toISOString().split("T")[0]
            : "",
      total:
        typeof data.total === "string"
          ? parseFloat(data.total) || 0
          : data.total,
    };
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: GoalTravelSchema) =>
      mode === "create" ? storeGoalTravel(data) : updateGoalTravel(id!, data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, mode));
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });

      await queryClient.invalidateQueries({
        queryKey: ["goal"],
      });
      if (mode === "update") {
        await refetch();
      }
      onClose();
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message ?? ERROR_MESSAGE(MODEL, mode));
    },
  });

  const handleSubmit = (data: GoalTravelSchema) => {
    mutate(data);
  };

  const isLoadingAny = loadingGoal;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {isLoadingAny ? (
        <FormSkeleton />
      ) : (
        <GoalTravelForm
          onCancel={onClose}
          onSubmit={handleSubmit}
          isSubmitting={isPending}
          mode={mode}
          defaultValues={goal ? mapGoalTravelToFrom(goal) : {}}
        />
      )}
    </GeneralModal>
  );
}
