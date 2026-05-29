"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { updateInsurance } from "@/features/gp/gestionhumana/planillas/insurances/lib/insurance.actions";
import { InsuranceSchema } from "@/features/gp/gestionhumana/planillas/insurances/lib/insurance.schema";
import { InsuranceResource } from "@/features/gp/gestionhumana/planillas/insurances/lib/insurance.interface";
import { InsuranceForm } from "@/features/gp/gestionhumana/planillas/insurances/components/InsuranceForm";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import FormWrapper from "@/shared/components/FormWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { INSURANCE } from "@/features/gp/gestionhumana/planillas/insurances/lib/insurance.constant";
import { useInsuranceById } from "@/features/gp/gestionhumana/planillas/insurances/lib/insurance.hook";

export default function UpdateInsurancePage() {
  const { MODEL, ABSOLUTE_ROUTE, QUERY_KEY, ROUTE } = INSURANCE;
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();

  const { data: insurance, isLoading: loadingInsurance } = useInsuranceById(
    Number(id),
  );

  const { mutate, isPending } = useMutation({
    mutationFn: (data: InsuranceSchema) => updateInsurance(Number(id), data),
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

  const handleSubmit = (data: InsuranceSchema) => {
    mutate(data);
  };

  function mapToForm(data: InsuranceResource): Partial<InsuranceSchema> {
    return {
      worker_id: String(data.worker_id),
      period_id: String(data.period_id),
      business_partner_id: String(data.business_partner_id),
      family_group_number: data.family_group_number ?? "",
      relationship: data.relationship ?? "",
      doc_type_affiliate: data.doc_type_affiliate ?? "",
      doc_number_affiliate: data.doc_number_affiliate ?? "",
      gender: data.gender ?? "",
      paternal_surname: data.paternal_surname ?? "",
      maternal_surname: data.maternal_surname ?? "",
      first_name: data.first_name ?? "",
      second_name: data.second_name ?? "",
      entry_date: data.entry_date ?? "",
      birth_date: data.birth_date ?? "",
      condition: data.condition ?? "",
      program: data.program ?? "",
      plan: data.plan ?? "",
      payment_frequency: data.payment_frequency ?? "",
      type: data.type ?? "",
      rate_without_tax: data.rate_without_tax,
      tax: data.tax,
      rate_with_tax: data.rate_with_tax,
      period_from: data.period_from ?? "",
      period_until: data.period_until ?? "",
      affiliation_continuity_date: data.affiliation_continuity_date ?? "",
      affiliation_from: data.affiliation_from ?? "",
      affiliation_until: data.affiliation_until ?? "",
    };
  }

  if (loadingInsurance || !insurance) {
    return <div className="p-4 text-muted">Cargando seguro...</div>;
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
      <InsuranceForm
        defaultValues={mapToForm(insurance)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
      />
    </FormWrapper>
  );
}
