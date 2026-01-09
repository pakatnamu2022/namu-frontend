import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useProductCategoryById } from "../lib/productCategory.hook";
import { ProductCategoryResource } from "../lib/productCategory.interface";
import { ProductCategorySchema } from "../lib/productCategory.schema";
import {
  storeProductCategory,
  updateProductCategory,
} from "../lib/productCategory.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { GeneralModal } from "@/shared/components/GeneralModal";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { ProductCategoryForm } from "./ProductCategoryForm";
import { PRODUCT_CATEGORY } from "../lib/productCategory.constants";
import { AP_MASTER_TYPE } from "@/features/ap/ap-master/lib/apMaster.constants";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
  mode: "create" | "update";
}

export default function ProductCategoryModal({
  id,
  open,
  onClose,
  title,
  mode,
}: Props) {
  const queryClient = useQueryClient();
  const { EMPTY, MODEL, QUERY_KEY } = PRODUCT_CATEGORY;
  const {
    data: ProductCategory,
    isLoading: loadingProductCategory,
    refetch,
  } = mode === "create"
    ? { data: EMPTY, isLoading: false, refetch: () => {} }
    : // eslint-disable-next-line react-hooks/rules-of-hooks
      useProductCategoryById(id!);

  function mapRoleToForm(
    data: ProductCategoryResource
  ): Partial<ProductCategorySchema> {
    return {
      code: data.code,
      description: data.description,
      type: AP_MASTER_TYPE.PRODUCT_CATEGORY,
    };
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ProductCategorySchema) =>
      mode === "create"
        ? storeProductCategory(data)
        : updateProductCategory(id!, data),
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

  const handleSubmit = (data: ProductCategorySchema) => {
    mutate({
      ...data,
    } as any);

    onClose();
  };

  const isLoadingAny = loadingProductCategory || !ProductCategory;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && ProductCategory ? (
        <ProductCategoryForm
          defaultValues={mapRoleToForm(ProductCategory)}
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
