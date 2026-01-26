"use client";

import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { storePayrollConcept } from "@/features/gp/gestionhumana/planillas/conceptos/lib/payroll-concept.actions";
import { PayrollConceptForm } from "@/features/gp/gestionhumana/planillas/conceptos/components/PayrollConceptForm";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { PayrollConceptSchema } from "@/features/gp/gestionhumana/planillas/conceptos/lib/payroll-concept.schema";
import FormWrapper from "@/shared/components/FormWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { PAYROLL_CONCEPT } from "@/features/gp/gestionhumana/planillas/conceptos/lib/payroll-concept.constant";

export default function AddPayrollConceptPage() {
  const { MODEL, ABSOLUTE_ROUTE } = PAYROLL_CONCEPT;
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { mutate, isPending } = useMutation({
    mutationFn: storePayrollConcept,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router(ABSOLUTE_ROUTE);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      errorToast(err?.response?.data?.message ?? ERROR_MESSAGE(MODEL, "create"));
    },
  });

  const handleSubmit = (data: PayrollConceptSchema) => {
    mutate(data);
  };

  if (!checkRouteExists("conceptos")) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="create"
        icon={currentView.icon}
      />
      <PayrollConceptForm
        defaultValues={{
          code: "",
          name: "",
          description: "",
          type: "EARNING",
          category: "BASE_SALARY",
          formula: "",
          formula_description: "",
          is_taxable: true,
          calculation_order: 0,
          active: true,
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
      />
    </FormWrapper>
  );
}
