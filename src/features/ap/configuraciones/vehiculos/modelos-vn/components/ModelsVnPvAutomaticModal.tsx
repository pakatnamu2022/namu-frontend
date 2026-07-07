import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { storeAutomaticModelsVn } from "../lib/modelsVn.actions";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { MODELS_VN } from "../lib/modelsVn.constanst";
import { CM_POSTVENTA_ID } from "@/features/ap/ap-master/lib/apMaster.constants";
import { ModelsVnPvAutomaticForm } from "./ModelsVnPvAutomaticForm";
import { ModelsVnPvAutomaticSchema } from "../lib/modelsVnPv.schema";
import { CLASS_ARTICLE_ID } from "../../../maestros-general/clase-articulo/lib/classArticle.constants";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
}

export default function ModelsVnPvAutomaticModal({
  open,
  onClose,
  title,
}: Props) {
  const queryClient = useQueryClient();
  const { QUERY_KEY, MODEL } = MODELS_VN;

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ModelsVnPvAutomaticSchema) =>
      storeAutomaticModelsVn(data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY],
      });
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message, ERROR_MESSAGE(MODEL, "create"));
    },
  });

  const handleSubmit = (data: ModelsVnPvAutomaticSchema) => {
    mutate(data);
    onClose();
  };

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      <ModelsVnPvAutomaticForm
        defaultValues={{
          brand_id: "",
          version: "",
          type_operation_id: String(CM_POSTVENTA_ID),
          class_id: String(CLASS_ARTICLE_ID.M_VEH_USA),
        }}
        onCancel={onClose}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
      />
    </GeneralModal>
  );
}
