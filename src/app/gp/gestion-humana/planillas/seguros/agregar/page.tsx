"use client";

import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { importInsurance } from "@/features/gp/gestionhumana/planillas/insurances/lib/insurance.actions";
import { InsuranceForm } from "@/features/gp/gestionhumana/planillas/insurances/components/InsuranceForm";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { InsuranceSchema } from "@/features/gp/gestionhumana/planillas/insurances/lib/insurance.schema";
import FormWrapper from "@/shared/components/FormWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { INSURANCE } from "@/features/gp/gestionhumana/planillas/insurances/lib/insurance.constant";

export default function AddInsurancePage() {
  const { MODEL, ABSOLUTE_ROUTE, ROUTE } = INSURANCE;
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { mutate, isPending } = useMutation({
    mutationFn: ({ data, file }: { data: InsuranceSchema; file: File }) =>
      importInsurance(file, data.period_id, data.business_partner_id),
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

  const handleSubmit = (data: InsuranceSchema, file: File) => {
    mutate({ data, file });
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
      <InsuranceForm onSubmit={handleSubmit} isSubmitting={isPending} />
    </FormWrapper>
  );
}
