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
import { CUSTOMERS_PV } from "@/features/ap/comercial/clientes/lib/customers.constants";
import { storeCustomers } from "@/features/ap/comercial/clientes/lib/customers.actions";
import { CustomersSchema } from "@/features/ap/comercial/clientes/lib/customers.schema";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { EMPRESA_AP } from "@/core/core.constants";
import { OPPORTUNITIES } from "@/features/ap/comercial/oportunidades/lib/opportunities.constants";
import { notFound } from "@/shared/hooks/useNotFound";
import { CustomersPvForm } from "@/features/ap/post-venta/taller/clientes-post-venta/components/CustomersPvForm";

export default function AddCustomersPvPage() {
  const router = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL, ABSOLUTE_ROUTE } = CUSTOMERS_PV;
  const { ABSOLUTE_ROUTE: OPPORTUNITIES_ROUTE } = OPPORTUNITIES;

  // Get query params
  const redirectTo = searchParams.get("redirect_to");
  const lead_id = searchParams.get("lead_id");

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
      <CustomersPvForm
        defaultValues={{
          first_name: "",
          middle_name: "",
          paternal_surname: "",
          maternal_surname: "",
          full_name: "",
          num_doc: "",
          direction: "",
          email: "",
          secondary_email: "",
          phone: "",
          secondary_phone: "",
          secondary_phone_contact_name: "",
          type_person_id: "",
          district_id: "",
          document_type_id: "",
          company_id: EMPRESA_AP.id,
          type: "",
          company_status: "",
          company_condition: "",
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
      />
    </FormWrapper>
  );
}
