import { useMutation, useQueryClient } from "@tanstack/react-query";
import FormSkeleton from "@/shared/components/FormSkeleton";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { ModelsVnSchema } from "../lib/modelsVn.schema";
import { storeModelsVn } from "../lib/modelsVn.actions";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { MODELS_VN } from "../lib/modelsVn.constanst";
import { CM_POSTVENTA_ID } from "@/features/ap/ap-master/lib/apMaster.constants";
import { ModelsVnPvForm } from "./ModelsVnPvForm";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
}

const { QUERY_KEY, MODEL } = MODELS_VN;

export default function ModelsVnModal({ open, onClose, title }: Props) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ModelsVnSchema) => storeModelsVn(data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      onClose();
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: ModelsVnSchema) => {
    mutate(data);
  };

  const defaultValues: Partial<ModelsVnSchema> = {
    type_operation_id: String(CM_POSTVENTA_ID),
  };

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {open ? (
        <ModelsVnPvForm
          defaultValues={defaultValues}
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
