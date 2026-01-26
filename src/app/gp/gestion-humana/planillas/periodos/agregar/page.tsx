"use client";

import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { storePayrollPeriod } from "@/features/gp/gestionhumana/planillas/periodo-planilla/lib/payroll-period.actions";
import { PayrollPeriodForm } from "@/features/gp/gestionhumana/planillas/periodo-planilla/components/PayrollPeriodForm";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { PayrollPeriodSchema } from "@/features/gp/gestionhumana/planillas/periodo-planilla/lib/payroll-period.schema";
import FormWrapper from "@/shared/components/FormWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { PAYROLL_PERIOD } from "@/features/gp/gestionhumana/planillas/periodo-planilla/lib/payroll-period.constant";

export default function AddPayrollPeriodPage() {
  const { MODEL, ABSOLUTE_ROUTE, ROUTE } = PAYROLL_PERIOD;
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { mutate, isPending } = useMutation({
    mutationFn: storePayrollPeriod,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router(ABSOLUTE_ROUTE);
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message ?? ERROR_MESSAGE(MODEL, "create")
      );
    },
  });

  const handleSubmit = (data: PayrollPeriodSchema) => {
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
      <PayrollPeriodForm
        defaultValues={{
          year: new Date().getFullYear(),
          month: new Date().getMonth() + 1,
          payment_date: "",
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
      />
    </FormWrapper>
  );
}
