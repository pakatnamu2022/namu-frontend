import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCategoryChecklistById } from "../lib/categoryChecklist.hook";
import { CategoryChecklistResource } from "../lib/categoryChecklist.interface";
import { CategoryChecklistSchema } from "../lib/categoryChecklist.schema";
import {
  storeCategoryChecklist,
  updateCategoryChecklist,
} from "../lib/categoryChecklist.actions";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { GeneralModal } from "@/shared/components/GeneralModal";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { CategoryChecklistForm } from "./CategoryChecklistForm";
import { CATEGORY_CHECKLIST } from "../lib/categoryChecklist.constants";
import { AP_MASTER_COMERCIAL } from "@/features/ap/lib/ap.constants";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
  mode: "create" | "update";
}

export default function CategoryChecklistModal({
  id,
  open,
  onClose,
  title,
  mode,
}: Props) {
  const queryClient = useQueryClient();
  const { EMPTY, MODEL, QUERY_KEY } = CATEGORY_CHECKLIST;
  const {
    data: categoryChecklist,
    isLoading: loadingCategoryChecklist,
    refetch,
  } = mode === "create"
    ? { data: EMPTY, isLoading: false, refetch: () => {} }
    : useCategoryChecklistById(id!);

  function mapCategoryChecklistToForm(
    data: CategoryChecklistResource
  ): Partial<CategoryChecklistSchema> {
    return {
      description: data.description,
      type: AP_MASTER_COMERCIAL.CATEGORIA_CHECKLIST,
    };
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: CategoryChecklistSchema) =>
      mode === "create"
        ? storeCategoryChecklist(data)
        : updateCategoryChecklist(id!, data),
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

  const handleSubmit = (data: CategoryChecklistSchema) => {
    mutate({
      ...data,
    } as any);

    onClose();
  };

  const isLoadingAny = loadingCategoryChecklist || !categoryChecklist;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && categoryChecklist ? (
        <CategoryChecklistForm
          defaultValues={mapCategoryChecklistToForm(categoryChecklist)}
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
