import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PerDiemCategoryResource } from "../lib/perDiemCategory.interface";
import { PerDiemCategorySchema } from "../lib/perDiemCategory.schema";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { GeneralModal } from "@/shared/components/GeneralModal";
import {
  storePerDiemCategory,
  updatePerDiemCategory,
} from "../lib/perDiemCategory.actions";
import { useFindPerDiemCategoryById } from "../lib/perDiemCategory.hook";
import { PerDiemCategoryForm } from "./PerDiemCategoryForm";
import { PER_DIEM_CATEGORY } from "../lib/perDiemCategory.constants";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
  mode: "create" | "update";
}

export default function PerDiemCategoryModal({
  id,
  open,
  onClose,
  title,
  mode,
}: Props) {
  const queryClient = useQueryClient();
  const { MODEL, QUERY_KEY } = PER_DIEM_CATEGORY;
  const {
    data: perDiemCategoryData,
    isLoading: loadingPerDiemCategory,
    refetch,
  } = useFindPerDiemCategoryById(id!);

  const perDiemCategory = mode === "create" ? { name: "", description: "", active: true } : perDiemCategoryData;

  function mapPerDiemCategoryToForm(
    data: PerDiemCategoryResource
  ): Partial<PerDiemCategorySchema> {
    return {
      name: data.name,
      description: data.description,
      active: data.active,
    };
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: PerDiemCategorySchema) =>
      mode === "create"
        ? storePerDiemCategory(data)
        : updatePerDiemCategory(id!, data),
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

  const handleSubmit = (data: PerDiemCategorySchema) => {
    mutate({
      ...data,
    } as any);

    onClose();
  };

  const isLoadingAny = loadingPerDiemCategory || !perDiemCategory;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && perDiemCategory ? (
        <PerDiemCategoryForm
          defaultValues={mapPerDiemCategoryToForm(perDiemCategory as PerDiemCategoryResource)}
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
