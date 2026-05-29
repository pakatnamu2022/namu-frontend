"use client";

import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { storeInsurance } from "@/features/gp/gestionhumana/planillas/insurances/lib/insurance.actions";
import { InsuranceForm } from "@/features/gp/gestionhumana/planillas/insurances/components/InsuranceForm";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { InsuranceSchema } from "@/features/gp/gestionhumana/planillas/insurances/lib/insurance.schema";
import FormWrapper from "@/shared/components/FormWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { INSURANCE } from "@/features/gp/gestionhumana/planillas/insurances/lib/insurance.constant";
import { useAllWorkers } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import { useAllPayrollPeriods } from "@/features/gp/gestionhumana/planillas/periodo-planilla/lib/payroll-period.hook";
import { Option } from "@/core/core.interface";

export default function AddInsurancePage() {
  const { MODEL, ABSOLUTE_ROUTE, ROUTE } = INSURANCE;
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { data: workers = [] } = useAllWorkers();
  const { data: periods = [] } = useAllPayrollPeriods();

  const workerOptions: Option[] = workers.map((w) => ({
    label: w.name,
    value: String(w.id),
  }));

  const periodOptions: Option[] = periods.map((p) => ({
    label: p.name,
    value: String(p.id),
  }));

  const businessPartnerOptions: Option[] = [];

  const { mutate, isPending } = useMutation({
    mutationFn: storeInsurance,
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

  const handleSubmit = (data: InsuranceSchema) => {
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
      <InsuranceForm
        defaultValues={{ status: "ACTIVO" }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        workerOptions={workerOptions}
        periodOptions={periodOptions}
        businessPartnerOptions={businessPartnerOptions}
      />
    </FormWrapper>
  );
}
