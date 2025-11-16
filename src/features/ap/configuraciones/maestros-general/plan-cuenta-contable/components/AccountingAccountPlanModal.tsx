import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAccountingAccountPlanById } from "../lib/accountingAccountPlan.hook";
import { AccountingAccountPlanResource } from "../lib/accountingAccountPlan.interface";
import { AccountingAccountPlanSchema } from "../lib/accountingAccountPlan.schema";
import {
  storeAccountingAccountPlan,
  updateAccountingAccountPlan,
} from "../lib/accountingAccountPlan.actions";
import { GeneralModal } from "@/src/shared/components/GeneralModal";
import { AccountingAccountPlanForm } from "./AccountingAccountPlanForm";
import FormSkeleton from "@/src/shared/components/FormSkeleton";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/src/core/core.function";
import { ACCOUNTING_ACCOUNT_PLAN } from "../lib/accountingAccountPlan.constants";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  title: string;
  mode: "create" | "update";
}

export default function AccountingAccountPlanModal({
  id,
  open,
  onClose,
  title,
  mode,
}: Props) {
  const queryClient = useQueryClient();
  const { EMPTY, MODEL, QUERY_KEY } = ACCOUNTING_ACCOUNT_PLAN;
  const {
    data: bank,
    isLoading: loadingAccountingAccountPlan,
    refetch,
  } = mode === "create"
    ? { data: EMPTY, isLoading: false, refetch: () => {} }
    : useAccountingAccountPlanById(id!);

  function mapAccountingAccountPlanToForm(
    data: AccountingAccountPlanResource
  ): Partial<AccountingAccountPlanSchema> {
    return {
      account: data.account,
      code_dynamics: data.code_dynamics || "",
      description: data.description,
      accounting_type_id: String(data.accounting_type_id),
    };
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: AccountingAccountPlanSchema) =>
      mode === "create"
        ? storeAccountingAccountPlan(data)
        : updateAccountingAccountPlan(id!, data),
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

  const handleSubmit = (data: AccountingAccountPlanSchema) => {
    mutate({
      ...data,
    } as any);

    onClose();
  };

  const isLoadingAny = loadingAccountingAccountPlan || !bank;

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="!max-w-(--breakpoint-md)"
    >
      {!isLoadingAny && bank ? (
        <AccountingAccountPlanForm
          defaultValues={mapAccountingAccountPlanToForm(bank)}
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
