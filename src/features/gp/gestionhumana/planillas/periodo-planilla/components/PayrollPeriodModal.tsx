"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { GeneralModal } from "@/shared/components/GeneralModal";
import {
  storePayrollPeriod,
  updatePayrollPeriod,
} from "../lib/payroll-period.actions";
import { useFindPayrollPeriodById } from "../lib/payroll-period.hook";
import { PayrollPeriodForm } from "./PayrollPeriodForm";
import { PAYROLL_PERIOD } from "../lib/payroll-period.constant";
import { PayrollPeriodSchema } from "../lib/payroll-period.schema";
import { PayrollPeriodResource } from "../lib/payroll-period.interface";

interface Props {
  id?: number;
  open: boolean;
  onClose: () => void;
  mode: "create" | "update";
}

export default function PayrollPeriodModal({ id, open, onClose, mode }: Props) {
  const queryClient = useQueryClient();
  const { MODEL, QUERY_KEY } = PAYROLL_PERIOD;

  const {
    data: payrollPeriod,
    isLoading: loadingPayrollPeriod,
  } = mode === "create"
    ? { data: undefined, isLoading: false }
    : // eslint-disable-next-line react-hooks/rules-of-hooks
      useFindPayrollPeriodById(id!);

  function mapToForm(data: PayrollPeriodResource): Partial<PayrollPeriodSchema> {
    return {
      year: data.year,
      month: data.month,
      payment_date: data.payment_date ?? "",
      company_id: data.company?.id,
    };
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: PayrollPeriodSchema) =>
      mode === "create"
        ? storePayrollPeriod(data)
        : updatePayrollPeriod(String(id!), data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, mode === "create" ? "create" : "update"));
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      onClose();
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message ??
          ERROR_MESSAGE(MODEL, mode === "create" ? "create" : "update")
      );
    },
  });

  const isLoadingAny = mode === "update" && (loadingPayrollPeriod || !payrollPeriod);

  const defaultValues =
    mode === "update" && payrollPeriod
      ? mapToForm(payrollPeriod)
      : {
          year: new Date().getFullYear(),
          month: new Date().getMonth() + 1,
          payment_date: "",
        };

  const title =
    mode === "create"
      ? `Agregar ${MODEL.name}`
      : `Editar ${MODEL.name}`;

  return (
    <GeneralModal open={open} onClose={onClose} title={title}>
      {isLoadingAny ? (
        <FormSkeleton />
      ) : (
        <PayrollPeriodForm
          defaultValues={defaultValues}
          onSubmit={(data) => mutate(data)}
          onCancel={onClose}
          isSubmitting={isPending}
          mode={mode}
        />
      )}
    </GeneralModal>
  );
}
