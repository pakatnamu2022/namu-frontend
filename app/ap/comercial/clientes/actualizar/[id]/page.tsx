"use client";

import { useParams } from 'react-router-dom';
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
import { CUSTOMERS } from "@/features/ap/comercial/clientes/lib/customers.constants";
import {
  findCustomersById,
  updateCustomers,
} from "@/features/ap/comercial/clientes/lib/customers.actions";
import { CustomersSchema } from "@/features/ap/comercial/clientes/lib/customers.schema";
import { CustomersResource } from "@/features/ap/comercial/clientes/lib/customers.interface";
import { CustomersForm } from "@/features/ap/comercial/clientes/components/CustomersForm";
import { parse } from "date-fns";
import NotFound from '@/app/not-found';


export default function EditCustomersPage() {
  
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, QUERY_KEY, MODEL } = CUSTOMERS;

  const { data: Customers, isLoading: loadingCustomers } = useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findCustomersById(Number(id)),
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: CustomersSchema) => updateCustomers(Number(id), data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, id],
      });
      router("../");
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "delete", msg));
    },
  });

  const handleSubmit = (data: CustomersSchema) => {
    mutate(data);
  };

  function mapCustomersToForm(
    data: CustomersResource
  ): Partial<CustomersSchema> {
    return {
      first_name: data.first_name,
      middle_name: data.middle_name || "",
      paternal_surname: data.paternal_surname || "",
      maternal_surname: data.maternal_surname || "",
      full_name: data.full_name || "",
      birth_date: data.birth_date
        ? parse(data.birth_date, "yyyy-MM-dd", new Date())
        : "",
      nationality: data.nationality,
      num_doc: data.num_doc,
      spouse_num_doc: data.spouse_num_doc || "",
      spouse_full_name: data.spouse_full_name || "",
      direction: data.direction || "",
      legal_representative_num_doc: data.legal_representative_num_doc || "",
      legal_representative_name: data.legal_representative_name || "",
      legal_representative_paternal_surname:
        data.legal_representative_paternal_surname || "",
      legal_representative_maternal_surname:
        data.legal_representative_maternal_surname || "",
      email: data.email,
      secondary_email: data.secondary_email || "",
      phone: data.phone,
      secondary_phone: data.secondary_phone || "",
      secondary_phone_contact_name: data.secondary_phone_contact_name || "",
      driver_num_doc: data.driver_num_doc || "",
      driver_full_name: data.driver_full_name || "",
      driving_license: data.driving_license || "",
      driving_license_expiration_date:
        data.driving_license_expiration_date || "",
      status_license: data.status_license || "",
      restriction: data.restriction || "",
      origin_id: data.origin_id ? String(data.origin_id) : "",
      tax_class_type_id: data.tax_class_type_id
        ? String(data.tax_class_type_id)
        : "",
      type_person_id: data.type_person_id ? String(data.type_person_id) : "",
      district_id: data.district_id ? String(data.district_id) : "",
      document_type_id: data.document_type_id
        ? String(data.document_type_id)
        : "",
      person_segment_id: data.person_segment_id
        ? String(data.person_segment_id)
        : "",
      marital_status_id: data.marital_status_id
        ? String(data.marital_status_id)
        : "",
      gender_id: data.gender_id ? String(data.gender_id) : "",
      activity_economic_id: data.activity_economic_id
        ? String(data.activity_economic_id)
        : "",
      company_id: data.company_id,
      company_status: data.company_status || "",
      company_condition: data.company_condition || "",
      type: data.type || "",
      driving_license_category: data.driving_license_category || "",
    };
  }

  const isLoadingAny = loadingCustomers || !Customers;

  if (isLoadingAny) {
    return <FormSkeleton />;
  }
  if (!checkRouteExists(ROUTE)) return <NotFound />;
  if (!currentView) return <NotFound />;

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="edit"
        icon={currentView.icon}
      />
      <CustomersForm
        defaultValues={mapCustomersToForm(Customers)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
      />
    </FormWrapper>
  );
}
