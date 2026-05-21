"use client";

import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useMutation } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import PageWrapper from "@/shared/components/PageWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { DECLARACION_JURADA_KYC } from "@/features/ap/comercial/declaracion-jurada-kyc/lib/declaracionJuradaKyc.constants";
import { storeCustomerKycDeclaration } from "@/features/ap/comercial/declaracion-jurada-kyc/lib/declaracionJuradaKyc.actions";
import { DeclaracionJuradaKycSchema } from "@/features/ap/comercial/declaracion-jurada-kyc/lib/declaracionJuradaKyc.schema";
import { DeclaracionJuradaKycLegalSchema } from "@/features/ap/comercial/declaracion-jurada-kyc/lib/declaracionJuradaKyc.schema";
import DeclaracionJuradaKycForm from "@/features/ap/comercial/declaracion-jurada-kyc/components/DeclaracionJuradaKycForm";
import DeclaracionJuradaKycLegalForm from "@/features/ap/comercial/declaracion-jurada-kyc/components/DeclaracionJuradaKycLegalForm";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { PERSON_TYPES } from "@/features/ap/comercial/declaracion-jurada-kyc/lib/declaracionJuradaKyc.constants";

type PersonType = "NATURAL" | "JURIDICA";

export default function AddDeclaracionJuradaKycPage() {
  const router = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL, ABSOLUTE_ROUTE } = DECLARACION_JURADA_KYC;

  const [personType, setPersonType] = useState<PersonType>("NATURAL");

  const { mutate, isPending } = useMutation({
    mutationFn: storeCustomerKycDeclaration,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router(ABSOLUTE_ROUTE);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmitNatural = (data: DeclaracionJuradaKycSchema) => {
    mutate({ ...data, person_type: "NATURAL" } as any);
  };

  const handleSubmitLegal = (data: DeclaracionJuradaKycLegalSchema) => {
    mutate({ ...data, person_type: "JURIDICA" } as any);
  };

  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <PageWrapper size="2xl">
      <TitleFormComponent
        title={currentView.descripcion}
        mode="create"
        icon={currentView.icon}
        backRoute={ABSOLUTE_ROUTE}
      />

      <div className="mb-4 max-w-xs">
        <SearchableSelect
          placeholder="Tipo de persona"
          options={PERSON_TYPES}
          value={personType}
          onChange={(val) => setPersonType((val || "NATURAL") as PersonType)}
        />
      </div>

      {personType === "JURIDICA" ? (
        <DeclaracionJuradaKycLegalForm
          defaultValues={{
            person_type: "JURIDICA",
            purchase_request_quote_id:
              searchParams.get("quote_id")
                ? Number(searchParams.get("quote_id"))
                : undefined,
            beneficiary_type: "PROPIO",
            declaration_date: new Date().toISOString().slice(0, 10),
          }}
          onSubmit={handleSubmitLegal}
          isSubmitting={isPending}
          mode="create"
          onCancel={() => router(ABSOLUTE_ROUTE)}
        />
      ) : (
        <DeclaracionJuradaKycForm
          defaultValues={{
            purchase_request_quote_id: searchParams.get("quote_id") ?? "",
            business_partner_id: searchParams.get("partner_id") ?? "",
            sede_id: searchParams.get("sede_id") ?? "",
            pep_status: "NO_SOY",
            pep_collaborator_status: "NO_SOY",
            is_pep_relative: "NO_SOY",
            beneficiary_type: "PROPIO",
            pep_relatives: [],
            pep_relative_data: [],
            declaration_date: new Date(),
          }}
          onSubmit={handleSubmitNatural}
          isSubmitting={isPending}
          mode="create"
          onCancel={() => router(ABSOLUTE_ROUTE)}
        />
      )}
    </PageWrapper>
  );
}
