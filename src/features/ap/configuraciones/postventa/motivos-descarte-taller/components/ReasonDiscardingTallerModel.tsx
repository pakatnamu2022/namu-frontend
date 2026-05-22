import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function.ts";
import { GeneralModal } from "@/shared/components/GeneralModal.tsx";
import FormSkeleton from "@/shared/components/FormSkeleton.tsx";
import { ReasonDiscardingTallerForm } from "./ReasonDiscardingTallerForm.tsx";
import { useReasonDiscardingTallerById } from "../lib/reasonDiscardingTaller.hook.ts";
import { ReasonDiscardingTallerResource } from "../lib/reasonDiscardingTaller.interface.ts";
import { ReasonDiscardingTallerSchema } from "../lib/reasonDiscardingTaller.schema.ts";
import {
  storeReasonDiscardingTaller,
  updateReasonDiscardingTaller,
} from "../lib/reasonDiscardingTaller.actions.ts";
import { REASONS_DISCARDING_TALLER } from "../lib/reasonDiscardingTaller.constants.ts";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
  mode: "create" | "update";
}

export default function ReasonDiscardingTallerModal({
  id,
  open,
  onClose,
  title,
  mode,
}: Props) {
  const queryClient = useQueryClient();
  const { EMPTY, MODEL, QUERY_KEY } = REASONS_DISCARDING_TALLER;
  const {
    data: ReasonDiscardingTaller,
    isLoading: loadingReasonDiscardingTaller,
    refetch,
  } = mode === "create"
    ? { data: EMPTY, isLoading: false, refetch: () => {} }
    : // eslint-disable-next-line react-hooks/rules-of-hooks
      useReasonDiscardingTallerById(id!);

  function mapRoleToForm(
    data: ReasonDiscardingTallerResource,
  ): Partial<ReasonDiscardingTallerSchema> {
    return {
      description: data.description,
      type: data.type,
    };
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ReasonDiscardingTallerSchema) =>
      mode === "create"
        ? storeReasonDiscardingTaller(data)
        : updateReasonDiscardingTaller(id!, data),
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

  const handleSubmit = (data: ReasonDiscardingTallerSchema) => {
    mutate({
      ...data,
    } as any);

    onClose();
  };

  const isLoadingAny = loadingReasonDiscardingTaller || !ReasonDiscardingTaller;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && ReasonDiscardingTaller ? (
        <ReasonDiscardingTallerForm
          defaultValues={mapRoleToForm(ReasonDiscardingTaller)}
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
