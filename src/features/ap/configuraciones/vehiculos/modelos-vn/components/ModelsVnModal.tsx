import { useMutation, useQueryClient } from "@tanstack/react-query";
import FormSkeleton from "@/shared/components/FormSkeleton";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { ModelsVnSchema } from "../lib/modelsVn.schema";
import { storeModelsVn, updateModelsVn } from "../lib/modelsVn.actions";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { MODELS_VN } from "../lib/modelsVn.constanst";
import { CM_POSTVENTA_ID } from "@/features/ap/ap-master/lib/apMaster.constants";
import { ModelsVnPvForm } from "./ModelsVnPvForm";
import { useModelVnById } from "../lib/modelsVn.hook";
import { ModelsVnResource } from "../lib/modelsVn.interface";
import { ModelsVnPvSchema } from "../lib/modelsVnPv.schema";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
  mode: "create" | "update";
}

export default function ModelsVnModal({
  id,
  open,
  onClose,
  title,
  mode,
}: Props) {
  const queryClient = useQueryClient();
  const { QUERY_KEY, MODEL } = MODELS_VN;
  const {
    data: modelVn,
    isLoading: loadingModelsVn,
    refetch,
  } = mode === "create"
    ? {
        data: {
          id: 0,
          brand_id: 0,
          family_id: 0,
          version: "",
        },
        isLoading: false,
        refetch: () => {},
      }
    : // eslint-disable-next-line react-hooks/rules-of-hooks
      useModelVnById(id!);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ModelsVnSchema) =>
      mode === "create" ? storeModelsVn(data) : updateModelsVn(id!, data),
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

  const handleSubmit = (data: ModelsVnSchema) => {
    mutate(data);
    onClose();
  };

  function mapModelVnToForm(data: ModelsVnResource): Partial<ModelsVnPvSchema> {
    return {
      family_id: String(data.family_id),
      brand_id: String(data.brand_id),
      version: data.version,
      type_operation_id: String(CM_POSTVENTA_ID),
    };
  }

  const isLoadingAny = loadingModelsVn || !modelVn;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && modelVn ? (
        <ModelsVnPvForm
          defaultValues={mapModelVnToForm(modelVn as ModelsVnResource)}
          onCancel={onClose}
          onSubmit={handleSubmit}
          isSubmitting={isPending}
          mode="create"
        />
      ) : (
        <FormSkeleton />
      )}
    </GeneralModal>
  );
}
