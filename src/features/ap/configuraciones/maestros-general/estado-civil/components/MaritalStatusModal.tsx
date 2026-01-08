import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MARITAL_STATUS } from "../lib/maritalStatus.constants";
import { useMaritalStatusById } from "../lib/maritalStatus.hook";
import { MaritalStatusResource } from "../lib/maritalStatus.interface";
import { MaritalStatusSchema } from "../lib/maritalStatus.schema";
import {
  storeMaritalStatus,
  updateMaritalStatus,
} from "../lib/maritalStatus.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { MaritalStatusForm } from "./MaritalStatusForm";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { AP_MASTER_TYPE } from "../../../../comercial/ap-master/lib/apMaster.constants";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
  mode: "create" | "update";
}

export default function MaritalStatusModal({
  id,
  open,
  onClose,
  title,
  mode,
}: Props) {
  const queryClient = useQueryClient();
  const { EMPTY, QUERY_KEY, MODEL } = MARITAL_STATUS;
  const {
    data: maritalStatus,
    isLoading: loadingMaritalStatus,
    refetch,
  } = mode === "create"
    ? { data: EMPTY, isLoading: false, refetch: () => {} }
    : useMaritalStatusById(id!);

  function mapMaritalStatusToForm(
    data: MaritalStatusResource
  ): Partial<MaritalStatusSchema> {
    return {
      description: data.description,
      type: AP_MASTER_TYPE.MARITAL_STATUS,
    };
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: MaritalStatusSchema) =>
      mode === "create"
        ? storeMaritalStatus(data)
        : updateMaritalStatus(id!, data),
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

  const handleSubmit = (data: MaritalStatusSchema) => {
    mutate({
      ...data,
    } as any);

    onClose();
  };

  const isLoadingAny = loadingMaritalStatus || !maritalStatus;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && maritalStatus ? (
        <MaritalStatusForm
          defaultValues={mapMaritalStatusToForm(maritalStatus)}
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
