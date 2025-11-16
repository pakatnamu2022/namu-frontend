import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEngineTypesById } from "../lib/engineTypes.hook";
import { EngineTypesResource } from "../lib/engineTypes.interface";
import { EngineTypesSchema } from "../lib/engineTypes.schema";
import {
  storeEngineTypes,
  updateEngineTypes,
} from "../lib/engineTypes.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { GeneralModal } from "@/shared/components/GeneralModal";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { EngineTypesForm } from "./EngineTypesForm";
import { ENGINE_TYPES } from "../lib/engineTypes.constants";
import { AP_MASTER_COMERCIAL } from "@/features/ap/lib/ap.constants";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
  mode: "create" | "update";
}

export default function EngineTypesModal({
  id,
  open,
  onClose,
  title,
  mode,
}: Props) {
  const queryClient = useQueryClient();
  const { EMPTY, MODEL, QUERY_KEY } = ENGINE_TYPES;
  const {
    data: EngineTypes,
    isLoading: loadingEngineTypes,
    refetch,
  } = mode === "create"
    ? { data: EMPTY, isLoading: false, refetch: () => {} }
    : useEngineTypesById(id!);

  function mapRoleToForm(
    data: EngineTypesResource
  ): Partial<EngineTypesSchema> {
    return {
      code: data.code,
      description: data.description,
      type: AP_MASTER_COMERCIAL.ENGINE_TYPE,
    };
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: EngineTypesSchema) =>
      mode === "create" ? storeEngineTypes(data) : updateEngineTypes(id!, data),
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

  const handleSubmit = (data: EngineTypesSchema) => {
    mutate({
      ...data,
    } as any);

    onClose();
  };

  const isLoadingAny = loadingEngineTypes || !EngineTypes;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && EngineTypes ? (
        <EngineTypesForm
          defaultValues={mapRoleToForm(EngineTypes)}
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
