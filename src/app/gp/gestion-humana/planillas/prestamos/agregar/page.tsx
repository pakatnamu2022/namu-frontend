"use client";

import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { storeLoan } from "@/features/gp/gestionhumana/planillas/loans/lib/loan.actions";
import { LoanForm } from "@/features/gp/gestionhumana/planillas/loans/components/LoanForm";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { LoanSchema } from "@/features/gp/gestionhumana/planillas/loans/lib/loan.schema";
import FormWrapper from "@/shared/components/FormWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { LOAN } from "@/features/gp/gestionhumana/planillas/loans/lib/loan.constant";
import { useAllWorkers } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import { useLoanConcepts } from "@/features/gp/gestionhumana/planillas/loans/lib/loan.hook";
import { Option } from "@/core/core.interface";

export default function AddLoanPage() {
  const { MODEL, ABSOLUTE_ROUTE, ROUTE } = LOAN;
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { data: workers = [] } = useAllWorkers();
  const { data: concepts = [] } = useLoanConcepts();

  const workerOptions: Option[] = workers.map((w) => ({
    label: w.name,
    value: String(w.id),
  }));

  const conceptOptions: Option[] = concepts.map((c) => ({
    label: c.description,
    value: String(c.id),
  }));

  const { mutate, isPending } = useMutation({
    mutationFn: storeLoan,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router(ABSOLUTE_ROUTE);
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message ?? ERROR_MESSAGE(MODEL, "create"),
      );
    },
  });

  const handleSubmit = (data: LoanSchema) => {
    mutate(data);
  };

  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="create"
        icon={currentView.icon}
      />
      <LoanForm
        defaultValues={{
          status: "ACTIVO",
          installments_count: 1,
          installment_amount: 0,
          loan_amount: 0,
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        workerOptions={workerOptions}
        conceptOptions={conceptOptions}
      />
    </FormWrapper>
  );
}
