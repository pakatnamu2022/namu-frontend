import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useProductCategoryById } from "@/features/ap/post-venta/gestion-almacen/categorias-producto/lib/productCategory.hook.ts";
import { ProductCategoryResource } from "@/features/ap/post-venta/gestion-almacen/categorias-producto/lib/productCategory.interface.ts";
import { ProductCategorySchema } from "@/features/ap/post-venta/gestion-almacen/categorias-producto/lib/productCategory.schema.ts";
import {
  storeProductCategory,
  updateProductCategory,
} from "@/features/ap/post-venta/gestion-almacen/categorias-producto/lib/productCategory.actions.ts";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function.ts";
import { GeneralModal } from "@/shared/components/GeneralModal.tsx";
import FormSkeleton from "@/shared/components/FormSkeleton.tsx";
import { ProductCategoryForm } from "./ProductCategoryForm.tsx";
import { PRODUCT_CATEGORY } from "@/features/ap/post-venta/gestion-almacen/categorias-producto/lib/productCategory.constants.ts";
import { AP_MASTER_TYPE } from "@/features/ap/ap-master/lib/apMaster.constants.ts";

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
