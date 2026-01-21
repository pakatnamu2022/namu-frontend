"use client";

import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import FormSkeleton from "@/shared/components/FormSkeleton";
import FormWrapper from "@/shared/components/FormWrapper";
import { CUSTOMERS_RP } from "@/features/ap/comercial/clientes/lib/customers.constants";
import {
  findCustomersById,
  updateCustomers,
} from "@/features/ap/comercial/clientes/lib/customers.actions";
import { CustomersResource } from "@/features/ap/comercial/clientes/lib/customers.interface";
import { notFound } from "@/shared/hooks/useNotFound";
import { CustomersRpForm } from "@/features/ap/post-venta/repuestos/clientes-repuestos/components/CustomersRpForm";
import { CustomersRpSchema } from "@/features/ap/post-venta/repuestos/clientes-repuestos/lib/customers-rp.schema";

export default function UpdateCustomersRpPage() {
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, QUERY_KEY, MODEL, ABSOLUTE_ROUTE } = CUSTOMERS_RP;

  const { data: Customers, isLoading: loadingCustomers } = useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findCustomersById(Number(id)),
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: CustomersRpSchema) => updateCustomers(Number(id), data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, id],
      });
      router(ABSOLUTE_ROUTE!);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "delete", msg));
    },
  });

  const handleSubmit = (data: CustomersRpSchema) => {
    mutate(data);
  };

  function mapCustomersToForm(
    data: CustomersResource
  ): Partial<CustomersRpSchema> {
    return {
      first_name: data.first_name,
      middle_name: data.middle_name || "",
      paternal_surname: data.paternal_surname || "",
      maternal_surname: data.maternal_surname || "",
      full_name: data.full_name || "",
      nationality: data.nationality,
      num_doc: data.num_doc,
      direction: data.direction || "",
      email: data.email,
      secondary_email: data.secondary_email || "",
      phone: data.phone,
      secondary_phone: data.secondary_phone || "",
      secondary_phone_contact_name: data.secondary_phone_contact_name || "",
      tax_class_type_id: data.tax_class_type_id
        ? String(data.tax_class_type_id)
        : "",
      type_person_id: data.type_person_id ? String(data.type_person_id) : "",
      district_id: data.district_id ? String(data.district_id) : "",
      document_type_id: data.document_type_id
        ? String(data.document_type_id)
        : "",
      company_id: data.company_id,
      company_status: data.company_status || "",
      company_condition: data.company_condition || "",
      type: data.type || "",
    };
  }

  const isLoadingAny = loadingCustomers || !Customers;

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
      <CustomersRpForm
        defaultValues={mapCustomersToForm(Customers)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
      />
    </FormWrapper>
  );
}
