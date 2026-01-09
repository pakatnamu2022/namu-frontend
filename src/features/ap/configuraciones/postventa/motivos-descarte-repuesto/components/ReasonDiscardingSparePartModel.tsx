import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function.ts";
import { GeneralModal } from "@/shared/components/GeneralModal.tsx";
import FormSkeleton from "@/shared/components/FormSkeleton.tsx";
import { ReasonDiscardingSparePartForm } from "./ReasonDiscardingSparePartForm.tsx";
import { REASONS_DISCARDING_SPAREPART } from "../lib/reasonDiscardingSparePart.constants.ts";
import { useReasonDiscardingSparePartById } from "../lib/reasonDiscardingSparePart.hook.ts";
import { ReasonDiscardingSparePartResource } from "../lib/reasonDiscardingSparePart.interface.ts";
import { ReasonDiscardingSparePartSchema } from "../lib/reasonDiscardingSparePart.schema.ts";
import {
  storeReasonDiscardingSparePart,
  updateReasonDiscardingSparePart,
} from "../lib/reasonDiscardingSparePart.actions.ts";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
  mode: "create" | "update";
}

export default function ReasonDiscardingSparePartModal({
  id,
  open,
  onClose,
  title,
  mode,
}: Props) {
  const queryClient = useQueryClient();
  const { EMPTY, MODEL, QUERY_KEY } = REASONS_DISCARDING_SPAREPART;
  const {
    data: ReasonDiscardingSparePart,
    isLoading: loadingReasonDiscardingSparePart,
    refetch,
  } = mode === "create"
    ? { data: EMPTY, isLoading: false, refetch: () => {} }
    : // eslint-disable-next-line react-hooks/rules-of-hooks
      useReasonDiscardingSparePartById(id!);

  function mapRoleToForm(
    data: ReasonDiscardingSparePartResource
  ): Partial<ReasonDiscardingSparePartSchema> {
    return {
      description: data.description,
      type: data.type,
    };
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ReasonDiscardingSparePartSchema) =>
      mode === "create"
        ? storeReasonDiscardingSparePart(data)
        : updateReasonDiscardingSparePart(id!, data),
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

  const handleSubmit = (data: ReasonDiscardingSparePartSchema) => {
    mutate({
      ...data,
    } as any);

    onClose();
  };

  const isLoadingAny =
    loadingReasonDiscardingSparePart || !ReasonDiscardingSparePart;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && ReasonDiscardingSparePart ? (
        <ReasonDiscardingSparePartForm
          defaultValues={mapRoleToForm(ReasonDiscardingSparePart)}
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
