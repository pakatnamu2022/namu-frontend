import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useBankById } from "../lib/bank.hook";
import { BankResource } from "../lib/bank.interface";
import { BankSchema } from "../lib/bank.schema";
import { storeBank, updateBank } from "../lib/bank.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/src/core/core.function";
import FormSkeleton from "@/src/shared/components/FormSkeleton";
import { GeneralModal } from "@/src/shared/components/GeneralModal";
import { BankForm } from "./BankForm";
import { BANK } from "../lib/bank.constants";
import { AP_MASTER_COMERCIAL } from "../../../../lib/ap.constants";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
  mode: "create" | "update";
}

export default function BankModal({ id, open, onClose, title, mode }: Props) {
  const queryClient = useQueryClient();
  const { EMPTY, QUERY_KEY, MODEL } = BANK;
  const {
    data: bank,
    isLoading: loadingBank,
    refetch,
  } = mode === "create"
    ? { data: EMPTY, isLoading: false, refetch: () => {} }
    : useBankById(id!);

  function mapBankToForm(data: BankResource): Partial<BankSchema> {
    return {
      code: data.code,
      description: data.description,
      type: AP_MASTER_COMERCIAL.BANK,
    };
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: BankSchema) =>
      mode === "create" ? storeBank(data) : updateBank(id!, data),
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

  const handleSubmit = (data: BankSchema) => {
    mutate({
      ...data,
    } as any);

    onClose();
  };

  const isLoadingAny = loadingBank || !bank;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && bank ? (
        <BankForm
          defaultValues={mapBankToForm(bank)}
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
