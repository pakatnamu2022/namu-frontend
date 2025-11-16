import { useMutation, useQueryClient } from "@tanstack/react-query";
import FormSkeleton from "@/shared/components/FormSkeleton";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { useReceptionChecklistById } from "../lib/receptionChecklist.hook";
import { ReceptionChecklistResource } from "../lib/receptionChecklist.interface";
import { ReceptionChecklistSchema } from "../lib/receptionChecklist.schema";
import {
  storeReceptionChecklist,
  updateReceptionChecklist,
} from "../lib/receptionChecklist.actions";
import { ReceptionChecklistForm } from "./ReceptionChecklistForm";
import { AP_CHECKLIST } from "@/core/core.constants";
import { ITEM_RECEPTION } from "../lib/receptionChecklist.constants";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
  mode: "create" | "update";
}

export default function ReceptionChecklistModal({
  id,
  open,
  onClose,
  title,
  mode,
}: Props) {
  const queryClient = useQueryClient();
  const { EMPTY, MODEL, QUERY_KEY } = ITEM_RECEPTION;
  const {
    data: ReceptionChecklist,
    isLoading: loadingReceptionChecklist,
    refetch,
  } = mode === "create"
    ? { data: EMPTY, isLoading: false, refetch: () => {} }
    : useReceptionChecklistById(id!);

  function mapRoleToForm(
    data: ReceptionChecklistResource
  ): Partial<ReceptionChecklistSchema> {
    return {
      description: data.description,
      type: AP_CHECKLIST.RECEPCION,
      category_id: String(data.category_id),
      has_quantity: data.has_quantity,
    };
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ReceptionChecklistSchema) =>
      mode === "create"
        ? storeReceptionChecklist(data)
        : updateReceptionChecklist(id!, data),
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

  const handleSubmit = (data: ReceptionChecklistSchema) => {
    mutate({
      ...data,
    } as any);

    onClose();
  };

  const isLoadingAny = loadingReceptionChecklist || !ReceptionChecklist;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && ReceptionChecklist ? (
        <ReceptionChecklistForm
          defaultValues={mapRoleToForm(ReceptionChecklist)}
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
