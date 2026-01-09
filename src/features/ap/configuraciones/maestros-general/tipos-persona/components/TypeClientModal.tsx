import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TYPE_PERSON } from "../lib/typeClient.constants";
import { useTypeClientById } from "../lib/typeClient.hook";
import { TypeClientResource } from "../lib/typeClient.interface";
import { TypeClientSchema } from "../lib/typeClient.schema";
import { storeTypeClient, updateTypeClient } from "../lib/typeClient.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { TypeClientForm } from "./TypeClientForm";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { AP_MASTER_TYPE } from "../../../../ap-master/lib/apMaster.constants";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
  mode: "create" | "update";
}

export default function TypeClientModal({
  id,
  open,
  onClose,
  title,
  mode,
}: Props) {
  const queryClient = useQueryClient();
  const { EMPTY, QUERY_KEY, MODEL } = TYPE_PERSON;
  const {
    data: bank,
    isLoading: loadingTypeClient,
    refetch,
  } = mode === "create"
    ? { data: EMPTY, isLoading: false, refetch: () => {} }
    : useTypeClientById(id!);

  function mapTypeClientToForm(
    data: TypeClientResource
  ): Partial<TypeClientSchema> {
    return {
      code: data.code,
      description: data.description,
      type: AP_MASTER_TYPE.TYPE_PERSON,
    };
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: TypeClientSchema) =>
      mode === "create" ? storeTypeClient(data) : updateTypeClient(id!, data),
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

  const handleSubmit = (data: TypeClientSchema) => {
    mutate({
      ...data,
    } as any);

    onClose();
  };

  const isLoadingAny = loadingTypeClient || !bank;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && bank ? (
        <TypeClientForm
          defaultValues={mapTypeClientToForm(bank)}
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
