"use client";

import { useNavigate, useSearchParams } from "react-router-dom";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useMutation } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import FormWrapper from "@/shared/components/FormWrapper";
import { CUSTOMERS } from "@/features/ap/comercial/clientes/lib/customers.constants";
import { storeCustomers } from "@/features/ap/comercial/clientes/lib/customers.actions";
import { CustomersSchema } from "@/features/ap/comercial/clientes/lib/customers.schema";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { CustomersForm } from "@/features/ap/comercial/clientes/components/CustomersForm";
import { EMPRESA_AP } from "@/core/core.constants";
import { OPPORTUNITIES } from "@/features/ap/comercial/oportunidades/lib/opportunities.constants";
import { notFound } from "@/shared/hooks/useNotFound";
import { format } from "date-fns";

export default function AddCustomersPage() {
  const router = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL, ABSOLUTE_ROUTE } = CUSTOMERS;
  const { ABSOLUTE_ROUTE: OPPORTUNITIES_ROUTE } = OPPORTUNITIES;

  // Get query params
  const redirectTo = searchParams.get("redirect_to");
  const fromLead = searchParams.get("from_lead");
  const lead_id = searchParams.get("lead_id");

  const leadData =
    fromLead === "true"
      ? {
          lead_id: lead_id || undefined,
          document_type_id: searchParams.get("document_type_id") || undefined,
          num_doc: searchParams.get("num_doc") || undefined,
          phone: searchParams.get("phone") || undefined,
          email: searchParams.get("email") || undefined,
          name: searchParams.get("name") || undefined,
          surnames: searchParams.get("surnames") || undefined,
        }
      : undefined;

  const { mutate, isPending } = useMutation({
    mutationFn: storeCustomers,
    onSuccess: (response) => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));

      // Redirect based on redirect_to param
      if (redirectTo === "opportunities") {
        router(
          `${OPPORTUNITIES_ROUTE}/agregar?client_id=${response.id}&lead_id=${lead_id}`
        );
      } else {
        router(ABSOLUTE_ROUTE!);
      }
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: CustomersSchema) => {
    const dataFormatted = {
      ...data,
      birth_date: data.birth_date
        ? format(data.birth_date, "yyyy-MM-dd")
        : undefined,
    };

    mutate(dataFormatted);
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
      <CustomersForm
        defaultValues={{
          first_name: "",
          middle_name: "",
          paternal_surname: "",
          maternal_surname: "",
          full_name: "",
          birth_date: new Date(),
          nationality: "NACIONAL",
          num_doc: "",
          spouse_num_doc: "",
          spouse_full_name: "",
          direction: "",
          legal_representative_num_doc: "",
          legal_representative_name: "",
          legal_representative_full_name: "",
          legal_representative_paternal_surname: "",
          legal_representative_maternal_surname: "",
          email: "",
          secondary_email: "",
          phone: "",
          secondary_phone: "",
          secondary_phone_contact_name: "",
          driver_num_doc: "",
          driver_full_name: "",
          driving_license: "",
          driving_license_expiration_date: "",
          status_license: "",
          restriction: "NO DEFINIDO",
          origin_id: "",
          tax_class_type_id: "",
          type_person_id: "",
          district_id: "",
          document_type_id: "",
          person_segment_id: "",
          marital_status_id: "",
          gender_id: "",
          activity_economic_id: "",
          company_id: EMPRESA_AP.id,
          type: "",
          company_status: "",
          company_condition: "",
          driving_license_category: "",
        }}
        leadData={leadData}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
        fromOpportunities={redirectTo === "opportunities"}
      />
    </FormWrapper>
  );
}
