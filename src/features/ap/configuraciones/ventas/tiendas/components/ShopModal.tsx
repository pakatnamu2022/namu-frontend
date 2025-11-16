import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useShopById } from "../lib/shop.hook";
import { ShopResource } from "../lib/shop.interface";
import { ShopSchema } from "../lib/shop.schema";
import { storeShop, updateShop } from "../lib/shop.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/src/core/core.function";
import { GeneralModal } from "@/src/shared/components/GeneralModal";
import { ShopForm } from "./ShopForm";
import FormSkeleton from "@/src/shared/components/FormSkeleton";
import { SHOP } from "../lib/shop.constants";
import { AP_MASTER_COMERCIAL } from "@/src/features/ap/lib/ap.constants";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
  mode: "create" | "update";
}

export default function ShopModal({ id, open, onClose, title, mode }: Props) {
  const queryClient = useQueryClient();
  const { EMPTY, MODEL, QUERY_KEY } = SHOP;
  const {
    data: Shop,
    isLoading: loadingShop,
    refetch,
  } = mode === "create"
    ? { data: EMPTY, isLoading: false, refetch: () => {} }
    : useShopById(id!);

  function mapRoleToForm(data: ShopResource): Partial<ShopSchema> {
    return {
      description: data.description,
      type: AP_MASTER_COMERCIAL.SHOP,
      sedes: data.sedes.map((sede) => ({
        id: sede.id,
        abreviatura: sede.abreviatura,
      })),
    };
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ShopSchema) =>
      mode === "create" ? storeShop(data) : updateShop(id!, data),
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

  const handleSubmit = (data: ShopSchema) => {
    mutate({
      ...data,
    } as any);

    onClose();
  };

  const isLoadingAny = loadingShop || !Shop;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && Shop ? (
        <ShopForm
          defaultValues={mapRoleToForm(Shop)}
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
