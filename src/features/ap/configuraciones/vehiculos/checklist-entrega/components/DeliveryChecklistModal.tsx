import { useMutation, useQueryClient } from "@tanstack/react-query";
import FormSkeleton from "@/src/shared/components/FormSkeleton";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/src/core/core.function";
import { GeneralModal } from "@/src/shared/components/GeneralModal";
import { useDeliveryChecklistById } from "../lib/deliveryChecklist.hook";
import { DeliveryChecklistResource } from "../lib/deliveryChecklist.interface";
import { DeliveryChecklistSchema } from "../lib/deliveryChecklist.schema";
import {
  storeDeliveryChecklist,
  updateDeliveryChecklist,
} from "../lib/deliveryChecklist.actions";
import { DeliveryChecklistForm } from "./DeliveryChecklistForm";
import { AP_CHECKLIST } from "@/src/core/core.constants";
import { ITEM_DELIVERY } from "../lib/deliveryChecklist.constants";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
  mode: "create" | "update";
}

export default function DeliveryChecklistModal({
  id,
  open,
  onClose,
  title,
  mode,
}: Props) {
  const queryClient = useQueryClient();
  const { EMPTY, MODEL, QUERY_KEY } = ITEM_DELIVERY;
  const {
    data: DeliveryChecklist,
    isLoading: loadingDeliveryChecklist,
    refetch,
  } = mode === "create"
    ? { data: EMPTY, isLoading: false, refetch: () => {} }
    : useDeliveryChecklistById(id!);

  function mapRoleToForm(
    data: DeliveryChecklistResource
  ): Partial<DeliveryChecklistSchema> {
    return {
      description: data.description,
      type: AP_CHECKLIST.ENTREGA,
      category_id: String(data.category_id),
      has_quantity: data.has_quantity,
    };
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: DeliveryChecklistSchema) =>
      mode === "create"
        ? storeDeliveryChecklist(data)
        : updateDeliveryChecklist(id!, data),
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

  const handleSubmit = (data: DeliveryChecklistSchema) => {
    console.log(data);
    mutate({
      ...data,
    } as any);

    onClose();
  };

  const isLoadingAny = loadingDeliveryChecklist || !DeliveryChecklist;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && DeliveryChecklist ? (
        <DeliveryChecklistForm
          defaultValues={mapRoleToForm(DeliveryChecklist)}
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
