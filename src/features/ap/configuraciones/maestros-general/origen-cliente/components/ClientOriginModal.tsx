import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CLIENT_ORIGIN } from "../lib/clientOrigin.constants";
import { useClientOriginById } from "../lib/clientOrigin.hook";
import { ClientOriginResource } from "../lib/clientOrigin.interface";
import { ClientOriginSchema } from "../lib/clientOrigin.schema";
import {
  storeClientOrigin,
  updateClientOrigin,
} from "../lib/clientOrigin.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { ClientOriginForm } from "./ClientOriginForm";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { AP_MASTER_TYPE } from "../../../../comercial/ap-master/lib/apMaster.constants";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
  mode: "create" | "update";
}

export default function ClientOriginModal({
  id,
  open,
  onClose,
  title,
  mode,
}: Props) {
  const queryClient = useQueryClient();
  const { EMPTY, QUERY_KEY, MODEL } = CLIENT_ORIGIN;
  const {
    data: bank,
    isLoading: loadingClientOrigin,
    refetch,
  } = mode === "create"
    ? { data: EMPTY, isLoading: false, refetch: () => {} }
    : useClientOriginById(id!);

  function mapClientOriginToForm(
    data: ClientOriginResource
  ): Partial<ClientOriginSchema> {
    return {
      description: data.description,
      type: AP_MASTER_TYPE.CLIENT_ORIGIN,
    };
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ClientOriginSchema) =>
      mode === "create"
        ? storeClientOrigin(data)
        : updateClientOrigin(id!, data),
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

  const handleSubmit = (data: ClientOriginSchema) => {
    mutate({
      ...data,
    } as any);

    onClose();
  };

  const isLoadingAny = loadingClientOrigin || !bank;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && bank ? (
        <ClientOriginForm
          defaultValues={mapClientOriginToForm(bank)}
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
