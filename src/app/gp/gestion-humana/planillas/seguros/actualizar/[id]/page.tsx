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
import { InsuranceManualSchema } from "@/features/gp/gestionhumana/planillas/insurances/lib/insurance.schema";
import { InsuranceResource } from "@/features/gp/gestionhumana/planillas/insurances/lib/insurance.interface";
import { InsuranceManualForm } from "@/features/gp/gestionhumana/planillas/insurances/components/InsuranceManualForm";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import FormWrapper from "@/shared/components/FormWrapper";
import FormSkeleton from "@/shared/components/FormSkeleton";
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
    mutationFn: (data: InsuranceManualSchema) =>
      updateInsurance(Number(id), {
        ...data,
        worker_id: Number(data.worker_id),
        period_id: Number(data.period_id),
        business_partner_id: Number(data.business_partner_id),
        doc_number_affiliate: data.doc_number_affiliate || null,
        contracting_name: data.contracting_name || null,
        num_doc_contracting: data.num_doc_contracting || null,
        rate_with_tax: data.rate_with_tax || 0,
      }),
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

  function mapToForm(
    data: InsuranceResource,
  ): Partial<InsuranceManualSchema> {
    return {
      company_id: data.company_id != null ? String(data.company_id) : "",
      worker_id: String(data.worker_id),
      period_id: String(data.period_id),
      business_partner_id: String(data.business_partner_id),
      doc_number_affiliate: data.doc_number_affiliate ?? "",
      contracting_name: data.contracting_name ?? "",
      num_doc_contracting: data.num_doc_contracting ?? "",
      rate_with_tax: data.rate_with_tax != null ? String(data.rate_with_tax) : "",
    };
  }

  const isLoadingAny = loadingInsurance || !insurance;

  if (isLoadingAny) {
    return <FormSkeleton />;
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
      <InsuranceManualForm
        defaultValues={mapToForm(insurance)}
        onSubmit={mutate}
        isSubmitting={isPending}
        mode="update"
        defaultWorkerLabel={insurance.worker}
        defaultPeriodLabel={insurance.period}
      />
    </FormWrapper>
  );
}
