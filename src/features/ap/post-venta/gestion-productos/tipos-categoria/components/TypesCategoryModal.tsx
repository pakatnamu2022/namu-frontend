import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTypesCategoryById } from "../lib/typesCategory.hook";
import { TypesCategoryResource } from "../lib/typesCategory.interface";
import { TypesCategorySchema } from "../lib/typesCategory.schema";
import {
  storeTypesCategory,
  updateTypesCategory,
} from "../lib/typesCategory.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { GeneralModal } from "@/shared/components/GeneralModal";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { TypesCategoryForm } from "./TypesCategoryForm";
import { TYPES_CATEGORY } from "../lib/typesCategory.constants";
import { AP_MASTER_POST_VENTA } from "@/features/ap/lib/ap.constants";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
  mode: "create" | "update";
}

export default function TypesCategoryModal({
  id,
  open,
  onClose,
  title,
  mode,
}: Props) {
  const queryClient = useQueryClient();
  const { EMPTY, MODEL, QUERY_KEY } = TYPES_CATEGORY;
  const {
    data: TypesCategory,
    isLoading: loadingTypesCategory,
    refetch,
  } = mode === "create"
    ? { data: EMPTY, isLoading: false, refetch: () => {} }
    : // eslint-disable-next-line react-hooks/rules-of-hooks
      useTypesCategoryById(id!);

  function mapRoleToForm(
    data: TypesCategoryResource
  ): Partial<TypesCategorySchema> {
    return {
      code: data.code,
      description: data.description,
      type: AP_MASTER_POST_VENTA.TYPE_CATEGORY,
    };
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: TypesCategorySchema) =>
      mode === "create"
        ? storeTypesCategory(data)
        : updateTypesCategory(id!, data),
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

  const handleSubmit = (data: TypesCategorySchema) => {
    mutate({
      ...data,
    } as any);

    onClose();
  };

  const isLoadingAny = loadingTypesCategory || !TypesCategory;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && TypesCategory ? (
        <TypesCategoryForm
          defaultValues={mapRoleToForm(TypesCategory)}
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
