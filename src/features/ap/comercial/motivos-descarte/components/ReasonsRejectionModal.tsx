import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ReasonsRejectionResource } from "../lib/reasonsRejection.interface";
import { ReasonsRejectionSchema } from "../lib/reasonsRejection.schema";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/src/core/core.function";
import FormSkeleton from "@/src/shared/components/FormSkeleton";
import { GeneralModal } from "@/src/shared/components/GeneralModal";
import {
  storeReasonsRejection,
  updateReasonsRejection,
} from "../lib/reasonsRejection.actions";
import { useReasonsRejectionById } from "../lib/reasonsRejection.hook";
import { ReasonsRejectionForm } from "./ReasonsRejectionForm";
import { REASONS_REJECTION } from "../lib/reasonsRejection.constants";
import { AP_MASTER_COMERCIAL } from "../../../lib/ap.constants";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
  mode: "create" | "update";
}

export default function ReasonsRejectionModal({
  id,
  open,
  onClose,
  title,
  mode,
}: Props) {
  const queryClient = useQueryClient();
  const { MODEL, EMPTY, QUERY_KEY } = REASONS_REJECTION;
  const {
    data: reasonsRejection,
    isLoading: loadingReasonsRejection,
    refetch,
  } = mode === "create"
    ? { data: EMPTY, isLoading: false, refetch: () => {} }
    : useReasonsRejectionById(id!);

  function mapReasonsRejectionToForm(
    data: ReasonsRejectionResource
  ): Partial<ReasonsRejectionSchema> {
    return {
      description: data.description,
      type: AP_MASTER_COMERCIAL.REASONS_REJECTION,
    };
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ReasonsRejectionSchema) =>
      mode === "create"
        ? storeReasonsRejection(data)
        : updateReasonsRejection(id!, data),
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

  const handleSubmit = (data: ReasonsRejectionSchema) => {
    mutate({
      ...data,
    } as any);

    onClose();
  };

  const isLoadingAny = loadingReasonsRejection || !reasonsRejection;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && reasonsRejection ? (
        <ReasonsRejectionForm
          defaultValues={mapReasonsRejectionToForm(reasonsRejection)}
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
