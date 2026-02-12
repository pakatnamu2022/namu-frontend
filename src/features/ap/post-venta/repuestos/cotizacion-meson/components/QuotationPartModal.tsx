import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { ProductSchema } from "@/features/ap/post-venta/gestion-almacen/productos/lib/product.schema";
import { storeProduct } from "@/features/ap/post-venta/gestion-almacen/productos/lib/product.actions";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { QuotationPartForm } from "./QuotationPartForm";
import { PRODUCT } from "@/features/ap/post-venta/gestion-almacen/productos/lib/product.constants";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess?: (productId: number) => void;
}

const { QUERY_KEY, MODEL } = PRODUCT;

export default function QuotationPartModal({
  open,
  onClose,
  onSuccess,
}: Props) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ProductSchema) => storeProduct(data),
    onSuccess: async (response) => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY],
      });
      onClose();
      if (onSuccess && response?.id) {
        onSuccess(response.id);
      }
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: ProductSchema) => {
    mutate(data);
  };

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title="Registrar Nuevo Repuesto"
      maxWidth="max-w-5xl"
    >
      <QuotationPartForm
        onCancel={onClose}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
      />
    </GeneralModal>
  );
}
