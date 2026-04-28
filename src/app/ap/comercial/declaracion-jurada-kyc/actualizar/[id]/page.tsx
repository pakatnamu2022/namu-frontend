"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import FormSkeleton from "@/shared/components/FormSkeleton";
import PageWrapper from "@/shared/components/PageWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { DECLARACION_JURADA_KYC } from "@/features/ap/comercial/declaracion-jurada-kyc/lib/declaracionJuradaKyc.constants";
import { updateCustomerKycDeclaration } from "@/features/ap/comercial/declaracion-jurada-kyc/lib/declaracionJuradaKyc.actions";
import { useCustomerKycDeclarationById } from "@/features/ap/comercial/declaracion-jurada-kyc/lib/declaracionJuradaKyc.hook";
import { DeclaracionJuradaKycSchema } from "@/features/ap/comercial/declaracion-jurada-kyc/lib/declaracionJuradaKyc.schema";
import { CustomerKycDeclarationResource } from "@/features/ap/comercial/declaracion-jurada-kyc/lib/declaracionJuradaKyc.interface";
import DeclaracionJuradaKycForm from "@/features/ap/comercial/declaracion-jurada-kyc/components/DeclaracionJuradaKycForm";

function mapToForm(
  data: CustomerKycDeclarationResource,
): Partial<DeclaracionJuradaKycSchema> {
  return {
    purchase_request_quote_id: data.purchase_request_quote_id
      ? String(data.purchase_request_quote_id)
      : undefined,
    business_partner_id: String(data.business_partner_id),
    company_id: String(data.company_id),
    occupation: data.occupation ?? "",
    fixed_phone: data.fixed_phone ?? "",
    purpose_relationship: data.purpose_relationship ?? "",
    pep_status: data.pep_status,
    pep_collaborator_status: data.pep_collaborator_status,
    pep_position: data.pep_position ?? "",
    pep_institution: data.pep_institution ?? "",
    pep_relatives: data.pep_relatives ?? [],
    pep_spouse_name: data.pep_spouse_name ?? "",
    is_pep_relative: data.is_pep_relative,
    pep_relative_data: data.pep_relative_data ?? [],
    beneficiary_type: data.beneficiary_type,
    own_funds_origin: data.own_funds_origin ?? "",
    third_full_name: data.third_full_name ?? "",
    third_doc_type: data.third_doc_type ?? "",
    third_doc_number: data.third_doc_number ?? "",
    third_representation_type: data.third_representation_type ?? undefined,
    third_pep_status: data.third_pep_status ?? undefined,
    third_pep_position: data.third_pep_position ?? "",
    third_pep_institution: data.third_pep_institution ?? "",
    third_funds_origin: data.third_funds_origin ?? "",
    entity_name: data.entity_name ?? "",
    entity_ruc: data.entity_ruc ?? "",
    entity_representation_type: data.entity_representation_type ?? undefined,
    entity_funds_origin: data.entity_funds_origin ?? "",
    entity_final_beneficiary: data.entity_final_beneficiary ?? "",
    declaration_date: data.declaration_date,
    status: data.status,
  };
}

export default function UpdateDeclaracionJuradaKycPage() {
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, QUERY_KEY, MODEL, ABSOLUTE_ROUTE } = DECLARACION_JURADA_KYC;

  const { data: declaration, isLoading } = useCustomerKycDeclarationById(
    Number(id),
  );

  const { mutate, isPending } = useMutation({
    mutationFn: (data: Partial<DeclaracionJuradaKycSchema>) =>
      updateCustomerKycDeclaration(Number(id), data as any),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY, Number(id)] });
      router(ABSOLUTE_ROUTE);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "update", msg));
    },
  });

  if (isLoading || !declaration) return <FormSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <PageWrapper size="2xl">
      <TitleFormComponent
        title={currentView.descripcion}
        mode="edit"
        icon={currentView.icon}
        backRoute={ABSOLUTE_ROUTE}
      />
      <DeclaracionJuradaKycForm
        defaultValues={mapToForm(declaration)}
        onSubmit={(data) => mutate(data)}
        isSubmitting={isPending}
        mode="update"
        onCancel={() => router(ABSOLUTE_ROUTE)}
        clientInfo={declaration}
      />
    </PageWrapper>
  );
}
