import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTractionTypeById } from "../lib/tractionType.hook";
import { TractionTypeResource } from "../lib/tractionType.interface";
import { TractionTypeSchema } from "../lib/tractionType.schema";
import {
  storeTractionType,
  updateTractionType,
} from "../lib/tractionType.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { TractionTypeForm } from "./TractionTypeForm";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { TRACTION_TYPE } from "../lib/tractionType.constants";
import { AP_MASTER_TYPE } from "@/features/ap/ap-master/lib/apMaster.constants";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
  mode: "create" | "update";
}

export default function TractionTypeModal({
  id,
  open,
  onClose,
  title,
  mode,
}: Props) {
  const queryClient = useQueryClient();
  const { EMPTY, MODEL, QUERY_KEY } = TRACTION_TYPE;
  const {
    data: TractionType,
    isLoading: loadingTractionType,
    refetch,
  } = mode === "create"
    ? { data: EMPTY, isLoading: false, refetch: () => {} }
    : useTractionTypeById(id!);

  function mapRoleToForm(
    data: TractionTypeResource
  ): Partial<TractionTypeSchema> {
    return {
      code: data.code,
      description: data.description,
      type: AP_MASTER_TYPE.TRACTION_TYPE,
    };
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: TractionTypeSchema) =>
      mode === "create"
        ? storeTractionType(data)
        : updateTractionType(id!, data),
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

  const handleSubmit = (data: TractionTypeSchema) => {
    mutate({
      ...data,
    } as any);

    onClose();
  };

  const isLoadingAny = loadingTractionType || !TractionType;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && TractionType ? (
        <TractionTypeForm
          defaultValues={mapRoleToForm(TractionType)}
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
