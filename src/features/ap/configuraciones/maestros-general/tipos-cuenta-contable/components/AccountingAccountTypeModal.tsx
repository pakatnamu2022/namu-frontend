import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAccountingAccountTypeById } from "../lib/accountingAccountType.hook";
import { AccountingAccountTypeResource } from "../lib/accountingAccountType.interface";
import { AccountingAccountTypeSchema } from "../lib/accountingAccountType.schema";
import {
  storeAccountingAccountType,
  updateAccountingAccountType,
} from "../lib/accountingAccountType.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { AccountingAccountTypeForm } from "./AccountingAccountTypeForm";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { ACCOUNTING_ACCOUNT_TYPE } from "../lib/accountingAccountType.constants";
import { AP_MASTER_COMERCIAL } from "../../../../lib/ap.constants";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
  mode: "create" | "update";
}

export default function AccountingAccountTypeModal({
  id,
  open,
  onClose,
  title,
  mode,
}: Props) {
  const queryClient = useQueryClient();
  const { EMPTY, MODEL, QUERY_KEY } = ACCOUNTING_ACCOUNT_TYPE;
  const {
    data: accountingAccountType,
    isLoading: loadingAccountingAccountType,
    refetch,
  } = mode === "create"
    ? { data: EMPTY, isLoading: false, refetch: () => {} }
    : useAccountingAccountTypeById(id!);

  function mapAccountingAccountTypeToForm(
    data: AccountingAccountTypeResource
  ): Partial<AccountingAccountTypeSchema> {
    return {
      description: data.description,
      type: AP_MASTER_COMERCIAL.ACCOUNTING_ACCOUNT_TYPE,
    };
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: AccountingAccountTypeSchema) =>
      mode === "create"
        ? storeAccountingAccountType(data)
        : updateAccountingAccountType(id!, data),
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

  const handleSubmit = (data: AccountingAccountTypeSchema) => {
    mutate({
      ...data,
    } as any);

    onClose();
  };

  const isLoadingAny = loadingAccountingAccountType || !accountingAccountType;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {!isLoadingAny && accountingAccountType ? (
        <AccountingAccountTypeForm
          defaultValues={mapAccountingAccountTypeToForm(accountingAccountType)}
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
