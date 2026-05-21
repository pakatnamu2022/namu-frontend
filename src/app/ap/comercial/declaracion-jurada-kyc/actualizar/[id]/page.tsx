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
import {
  DeclaracionJuradaKycSchema,
  DeclaracionJuradaKycLegalSchema,
} from "@/features/ap/comercial/declaracion-jurada-kyc/lib/declaracionJuradaKyc.schema";
import {
  CustomerKycDeclarationResource,
  CustomerKycDeclarationLegal,
} from "@/features/ap/comercial/declaracion-jurada-kyc/lib/declaracionJuradaKyc.interface";
import DeclaracionJuradaKycForm from "@/features/ap/comercial/declaracion-jurada-kyc/components/DeclaracionJuradaKycForm";
import DeclaracionJuradaKycLegalForm from "@/features/ap/comercial/declaracion-jurada-kyc/components/DeclaracionJuradaKycLegalForm";

function mapNaturalToForm(
  data: CustomerKycDeclarationResource,
): Partial<DeclaracionJuradaKycSchema> {
  return {
    purchase_request_quote_id: data.purchase_request_quote_id
      ? String(data.purchase_request_quote_id)
      : undefined,
    business_partner_id: String(data.business_partner_id),
    sede_id: String(data.sede_id),
    occupation: data.occupation ?? "",
    cargo: data.cargo ?? "",
    fixed_phone: data.fixed_phone ?? "",
    purpose_relationship: data.purpose_relationship ?? "",
    pep_status: data.pep_status,
    pep_collaborator_status: data.pep_collaborator_status,
    pep_position: data.pep_position ?? "",
    pep_institution: data.pep_institution ?? "",
    pep_relatives: data.pep_relatives ?? [],
    pep_spouse_name: data.pep_spouse_name ?? "",
    is_pep_relative: data.is_pep_relative,
    pep_relative_data: (data.pep_relative_data ?? []).map((r) => ({
      ...r,
      cargo: r.cargo ?? undefined,
      institution: r.institution ?? undefined,
    })),
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

function mapLegalToForm(
  data: CustomerKycDeclarationLegal,
): Partial<DeclaracionJuradaKycLegalSchema> {
  return {
    person_type: "JURIDICA",
    business_partner_id: data.business_partner_id,
    sede_id: data.sede_id,
    purchase_request_quote_id: data.purchase_request_quote_id ?? undefined,
    declaration_date: data.declaration_date,
    company_name: data.company_name ?? "",
    ruc: data.ruc ?? "",
    foreign_registry_number: data.foreign_registry_number ?? "",
    business_purpose: data.business_purpose ?? "",
    final_beneficiaries: data.final_beneficiaries ?? "",
    purpose_relationship: data.purpose_relationship ?? "",
    rep_full_name: data.rep_full_name ?? "",
    rep_doc_type: data.rep_doc_type ?? undefined,
    rep_doc_number: data.rep_doc_number ?? "",
    rep_doc_other: data.rep_doc_other ?? "",
    rep_representation_type: data.rep_representation_type ?? undefined,
    rep_instrument_type: data.rep_instrument_type ?? undefined,
    rep_escritura_date: data.rep_escritura_date ?? "",
    rep_notary_name: data.rep_notary_name ?? "",
    rep_acta_certified_date: data.rep_acta_certified_date ?? "",
    rep_acta_date: data.rep_acta_date ?? "",
    rep_instrument_other: data.rep_instrument_other ?? "",
    rep_registry_partition: data.rep_registry_partition ?? "",
    rep_registry_seat: data.rep_registry_seat ?? "",
    rep_registry_section: data.rep_registry_section ?? "",
    rep_registry_zone: data.rep_registry_zone ?? "",
    office_street_type: data.office_street_type ?? undefined,
    office_street_name: data.office_street_name ?? "",
    office_number: data.office_number ?? "",
    office_int_number: data.office_int_number ?? "",
    office_urbanization: data.office_urbanization ?? "",
    office_district_id: data.office_district_id ?? undefined,
    office_phone: data.office_phone ?? "",
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
    account_number: data.account_number ?? "",
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
    mutationFn: (data: any) =>
      updateCustomerKycDeclaration(Number(id), data),
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

  const isJuridica = declaration.person_type === "JURIDICA";

  return (
    <PageWrapper size="2xl">
      <TitleFormComponent
        title={currentView.descripcion}
        mode="edit"
        icon={currentView.icon}
        backRoute={ABSOLUTE_ROUTE}
      />
      {isJuridica ? (
        <DeclaracionJuradaKycLegalForm
          defaultValues={mapLegalToForm(
            declaration as unknown as CustomerKycDeclarationLegal,
          )}
          onSubmit={(data) => mutate({ ...data, person_type: "JURIDICA" })}
          isSubmitting={isPending}
          mode="update"
          onCancel={() => router(ABSOLUTE_ROUTE)}
          legalInfo={declaration as unknown as CustomerKycDeclarationLegal}
        />
      ) : (
        <DeclaracionJuradaKycForm
          defaultValues={mapNaturalToForm(declaration)}
          onSubmit={(data) => mutate(data)}
          isSubmitting={isPending}
          mode="update"
          onCancel={() => router(ABSOLUTE_ROUTE)}
          clientInfo={declaration}
        />
      )}
    </PageWrapper>
  );
}
