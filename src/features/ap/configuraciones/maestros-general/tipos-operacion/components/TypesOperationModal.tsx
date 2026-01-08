import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTypesOperationById } from "../lib/typesOperation.hook";
import { TypesOperationResource } from "../lib/typesOperation.interface";
import { TypesOperationSchema } from "../lib/typesOperation.schema";
import {
  storeTypesOperation,
  updateTypesOperation,
} from "../lib/typesOperation.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { TypesOperationForm } from "./TypesOperationForm";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { TYPES_OPERATION } from "../lib/typesOperation.constants";
import { AP_MASTER_TYPE } from "../../../../comercial/ap-master/lib/apMaster.constants";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
  mode: "create" | "update";
}

export default function TypesOperationModal({
  id,
  open,
  onClose,
  title,
  mode,
}: Props) {
  const queryClient = useQueryClient();
  const { EMPTY, QUERY_KEY, MODEL } = TYPES_OPERATION;
  const {
    data: typesOperation,
    isLoading: loadingTypesOperation,
    refetch,
  } = mode === "create"
    ? { data: EMPTY, isLoading: false, refetch: () => {} }
    : useTypesOperationById(id!);

  function mapTypesOperationToForm(
    data: TypesOperationResource
  ): Partial<TypesOperationSchema> {
    return {
      description: data.description,
      type: AP_MASTER_TYPE.TYPE_OPERATION,
    };
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: TypesOperationSchema) =>
      mode === "create"
        ? storeTypesOperation(data)
        : updateTypesOperation(id!, data),
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

  const handleSubmit = (data: TypesOperationSchema) => {
    mutate({
      ...data,
    } as any);

    onClose();
  };

  const isLoadingAny = loadingTypesOperation || !typesOperation;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && typesOperation ? (
        <TypesOperationForm
          defaultValues={mapTypesOperationToForm(typesOperation)}
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
