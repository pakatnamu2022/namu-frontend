import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useProductTypeById } from "../lib/productType.hook";
import { ProductTypeResource } from "../lib/productType.interface";
import { ProductTypeSchema } from "../lib/productType.schema";
import {
  storeProductType,
  updateProductType,
} from "../lib/productType.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { ProductTypeForm } from "./ProductTypeForm";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { PRODUCT_TYPE } from "../lib/productType.constants";
import { AP_MASTER_TYPE } from "@/features/ap/comercial/ap-master/lib/apMaster.constants";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
  mode: "create" | "update";
}

export default function ProductTypeModal({
  id,
  open,
  onClose,
  title,
  mode,
}: Props) {
  const queryClient = useQueryClient();
  const { EMPTY, QUERY_KEY, MODEL } = PRODUCT_TYPE;
  const {
    data: productTypeData,
    isLoading: loadingProductType,
    refetch,
  } = useProductTypeById(id!);

  const ProductType = mode === "create" ? EMPTY : productTypeData;

  function mapRoleToForm(
    data: ProductTypeResource
  ): Partial<ProductTypeSchema> {
    return {
      code: data.code,
      description: data.description,
      type: AP_MASTER_TYPE.PRODUCT_TYPE,
    };
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ProductTypeSchema) =>
      mode === "create" ? storeProductType(data) : updateProductType(id!, data),
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

  const handleSubmit = (data: ProductTypeSchema) => {
    mutate({
      ...data,
    } as any);

    onClose();
  };

  const isLoadingAny = loadingProductType || !ProductType;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && ProductType ? (
        <ProductTypeForm
          defaultValues={mapRoleToForm(ProductType)}
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
