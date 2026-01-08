import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTypesPlanningById } from "../lib/typesPlanning.hook.ts";
import { TypesPlanningResource } from "../lib/typesPlanning.interface.ts";
import { TypesPlanningSchema } from "../lib/typesPlanning.schema.ts";
import {
  storeTypesPlanning,
  updateTypesPlanning,
} from "../lib/typesPlanning.actions.ts";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function.ts";
import { GeneralModal } from "@/shared/components/GeneralModal.tsx";
import FormSkeleton from "@/shared/components/FormSkeleton.tsx";
import { TypesPlanningForm } from "./TypesPlanningForm.tsx";
import { AP_MASTER_TYPE } from "@/features/ap/comercial/ap-master/lib/apMaster.constants.ts";
import { TYPE_PLANNING } from "../lib/typesPlanning.constants.ts";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
  mode: "create" | "update";
}

export default function TypesPlanningModal({
  id,
  open,
  onClose,
  title,
  mode,
}: Props) {
  const queryClient = useQueryClient();
  const { EMPTY, MODEL, QUERY_KEY } = TYPE_PLANNING;
  const {
    data: TypesPlanning,
    isLoading: loadingTypesPlanning,
    refetch,
  } = mode === "create"
    ? { data: EMPTY, isLoading: false, refetch: () => {} }
    : // eslint-disable-next-line react-hooks/rules-of-hooks
      useTypesPlanningById(id!);

  function mapRoleToForm(
    data: TypesPlanningResource
  ): Partial<TypesPlanningSchema> {
    return {
      code: data.code,
      description: data.description,
      type: AP_MASTER_TYPE.TYPE_PLANNING,
    };
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: TypesPlanningSchema) =>
      mode === "create"
        ? storeTypesPlanning(data)
        : updateTypesPlanning(id!, data),
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

  const handleSubmit = (data: TypesPlanningSchema) => {
    mutate({
      ...data,
    } as any);

    onClose();
  };

  const isLoadingAny = loadingTypesPlanning || !TypesPlanning;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && TypesPlanning ? (
        <TypesPlanningForm
          defaultValues={mapRoleToForm(TypesPlanning)}
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
