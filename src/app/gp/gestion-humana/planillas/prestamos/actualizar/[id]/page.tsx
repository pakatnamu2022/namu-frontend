"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { updateLoan } from "@/features/gp/gestionhumana/planillas/loans/lib/loan.actions";
import { LoanSchema } from "@/features/gp/gestionhumana/planillas/loans/lib/loan.schema";
import { LoanResource } from "@/features/gp/gestionhumana/planillas/loans/lib/loan.interface";
import { LoanForm } from "@/features/gp/gestionhumana/planillas/loans/components/LoanForm";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import FormWrapper from "@/shared/components/FormWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { LOAN } from "@/features/gp/gestionhumana/planillas/loans/lib/loan.constant";
import { useLoanById } from "@/features/gp/gestionhumana/planillas/loans/lib/loan.hook";

export default function UpdateLoanPage() {
  const { MODEL, ABSOLUTE_ROUTE, QUERY_KEY, ROUTE } = LOAN;
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { data: loan, isLoading: loadingLoan } = useLoanById(Number(id));

  const { mutate, isPending } = useMutation({
    mutationFn: (data: LoanSchema) => updateLoan(Number(id), data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
      router(ABSOLUTE_ROUTE);
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message ?? ERROR_MESSAGE(MODEL, "update"),
      );
    },
  });

  const handleSubmit = (data: LoanSchema) => {
    mutate(data);
  };

  function mapToForm(data: LoanResource): Partial<LoanSchema> {
    return {
      worker_id: String(data.worker_id),
      delivery_date: data.delivery_date,
      reason: data.reason,
      payment_start: data.payment_start,
      payment_days: data.payment_days ?? [],
      loan_amount: data.loan_amount,
      installments_count: data.installments_count,
      installment_amount: data.installment_amount,
      status: data.status,
    };
  }

  if (loadingLoan || !loan) {
    return <div className="p-4 text-muted">Cargando préstamo...</div>;
  }
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="edit"
        icon={currentView.icon}
      />
      <LoanForm
        defaultValues={mapToForm(loan)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
      />
    </FormWrapper>
  );
}
