import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useProductShelfById } from "@/features/ap/post-venta/gestion-almacen/estantes-almacen/lib/productShelf.hook.ts";
import { ProductShelfResource } from "@/features/ap/post-venta/gestion-almacen/estantes-almacen/lib/productShelf.interface.ts";
import { ProductShelfSchema } from "@/features/ap/post-venta/gestion-almacen/estantes-almacen/lib/productShelf.schema.ts";
import {
  storeProductShelf,
  updateProductShelf,
} from "@/features/ap/post-venta/gestion-almacen/estantes-almacen/lib/productShelf.actions.ts";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function.ts";
import { GeneralModal } from "@/shared/components/GeneralModal.tsx";
import FormSkeleton from "@/shared/components/FormSkeleton.tsx";
import { ProductShelfForm } from "./ProductShelfForm.tsx";
import { PRODUCT_SHELF } from "@/features/ap/post-venta/gestion-almacen/estantes-almacen/lib/productShelf.constants.ts";
import { WarehouseResource } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.interface.ts";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
  mode: "create" | "update";
  warehouses: WarehouseResource[];
  defaultWarehouseId?: string;
}

export default function ProductShelfModal({
  id,
  open,
  onClose,
  title,
  mode,
  warehouses,
  defaultWarehouseId,
}: Props) {
  const queryClient = useQueryClient();
  const { EMPTY, MODEL, QUERY_KEY, ICON } = PRODUCT_SHELF;
  const {
    data: productShelf,
    isLoading: loadingProductShelf,
    refetch,
  } = mode === "create"
    ? { data: EMPTY, isLoading: false, refetch: () => {} }
    : // eslint-disable-next-line react-hooks/rules-of-hooks
      useProductShelfById(id!);

  function mapToForm(
    data: ProductShelfResource,
  ): Partial<ProductShelfSchema> {
    if (mode === "create") {
      return {
        warehouse_id: defaultWarehouseId ?? "",
        label: "",
        notes: "",
        status: true,
      };
    }
    return {
      warehouse_id: data.warehouse_id ? data.warehouse_id.toString() : "",
      label: data.label,
      notes: data.notes ?? "",
      status: data.status,
    };
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ProductShelfSchema) =>
      mode === "create"
        ? storeProductShelf({
            warehouse_id: Number(data.warehouse_id),
            label: data.label,
            notes: data.notes || undefined,
            status: data.status,
          })
        : updateProductShelf(id!, {
            warehouse_id: data.warehouse_id
              ? Number(data.warehouse_id)
              : undefined,
            label: data.label,
            notes: data.notes ?? undefined,
            status: data.status,
          }),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, mode));
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      await refetch();
      onClose();
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message, ERROR_MESSAGE(MODEL, mode));
    },
  });

  const handleSubmit = (data: ProductShelfSchema) => {
    mutate(data);
  };

  const isLoadingAny = loadingProductShelf || !productShelf;

  return (
    <GeneralModal open={open} onClose={onClose} title={title} icon={ICON}>
      {!isLoadingAny && productShelf ? (
        <ProductShelfForm
          defaultValues={mapToForm(productShelf)}
          onCancel={onClose}
          onSubmit={handleSubmit}
          isSubmitting={isPending}
          mode={mode}
          warehouses={warehouses}
        />
      ) : (
        <FormSkeleton />
      )}
    </GeneralModal>
  );
}
