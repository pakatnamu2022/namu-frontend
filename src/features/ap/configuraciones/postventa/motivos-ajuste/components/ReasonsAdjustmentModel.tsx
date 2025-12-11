import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useReasonsAdjustmentById } from "@/features/ap/configuraciones/postventa/motivos-ajuste/lib/reasonsAdjustment.hook.ts";
import { ReasonsAdjustmentResource } from "@/features/ap/configuraciones/postventa/motivos-ajuste/lib/reasonsAdjustment.interface.ts";
import { ReasonsAdjustmentSchema } from "@/features/ap/configuraciones/postventa/motivos-ajuste/lib/reasonsAdjustment.schema.ts";
import {
  storeReasonsAdjustment,
  updateReasonsAdjustment,
} from "@/features/ap/configuraciones/postventa/motivos-ajuste/lib/reasonsAdjustment.actions.ts";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function.ts";
import { GeneralModal } from "@/shared/components/GeneralModal.tsx";
import FormSkeleton from "@/shared/components/FormSkeleton.tsx";
import { ReasonsAdjustmentForm } from "./ReasonsAdjustmentForm.tsx";
import { REASONS_ADJUSTMENT } from "@/features/ap/configuraciones/postventa/motivos-ajuste/lib/reasonsAdjustment.constants.ts";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
  mode: "create" | "update";
}

export default function ReasonsAdjustmentModal({
  id,
  open,
  onClose,
  title,
  mode,
}: Props) {
  const queryClient = useQueryClient();
  const { EMPTY, MODEL, QUERY_KEY } = REASONS_ADJUSTMENT;
  const {
    data: fetchedData,
    isLoading: loadingReasonsAdjustment,
    refetch,
  } = useReasonsAdjustmentById(id);

  const ReasonsAdjustment = mode === "create" ? EMPTY : fetchedData;

  function mapRoleToForm(
    data: ReasonsAdjustmentResource
  ): Partial<ReasonsAdjustmentSchema> {
    return {
      code: data.code,
      description: data.description,
      type: data.type,
    };
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ReasonsAdjustmentSchema) =>
      mode === "create"
        ? storeReasonsAdjustment(data)
        : updateReasonsAdjustment(id!, data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, mode));
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY],
      });
      // Solo refetch cuando estamos en modo update y tenemos un id válido
      if (mode === "update" && id) {
        await refetch();
      }
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message, ERROR_MESSAGE(MODEL, mode));
    },
  });

  const handleSubmit = (data: ReasonsAdjustmentSchema) => {
    mutate({
      ...data,
    } as any);

    onClose();
  };

  const isLoadingAny = loadingReasonsAdjustment || !ReasonsAdjustment;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && ReasonsAdjustment ? (
        <ReasonsAdjustmentForm
          defaultValues={mapRoleToForm(ReasonsAdjustment)}
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
