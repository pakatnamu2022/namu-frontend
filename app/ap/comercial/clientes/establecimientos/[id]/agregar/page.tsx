"use client";

import { notFound, useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/src/core/core.function";
import TitleFormComponent from "@/src/shared/components/TitleFormComponent";
import FormSkeleton from "@/src/shared/components/FormSkeleton";
import FormWrapper from "@/src/shared/components/FormWrapper";
import { ESTABLISHMENTS } from "@/src/features/ap/comercial/establecimientos/lib/establishments.constants";
import { createEstablishments } from "@/src/features/ap/comercial/establecimientos/lib/establishments.actions";
import { EstablishmentsSchema } from "@/src/features/ap/comercial/establecimientos/lib/establishments.schema";
import { EstablishmentsForm } from "@/src/features/ap/comercial/establecimientos/components/EstablishmentsForm";
import { CUSTOMERS } from "@/src/features/ap/comercial/clientes/lib/customers.constants";
import { findCustomersById } from "@/src/features/ap/comercial/clientes/lib/customers.actions";

export default function NewEstablishmentPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { MODEL } = ESTABLISHMENTS;

  // Get customer data
  const { data: customer, isLoading: loadingCustomer } = useQuery({
    queryKey: [CUSTOMERS.QUERY_KEY, id],
    queryFn: () => findCustomersById(Number(id)),
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: EstablishmentsSchema) => createEstablishments(data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      await queryClient.invalidateQueries({
        queryKey: [ESTABLISHMENTS.QUERY_KEY],
      });
      router.push(`/ap/comercial/clientes/establecimientos/${id}`);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: EstablishmentsSchema) => {
    mutate(data);
  };

  const isLoadingAny = loadingCustomer || !customer;

  if (isLoadingAny) {
    return <FormSkeleton />;
  }
  if (!checkRouteExists(CUSTOMERS.ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={`Nuevo Establecimiento - ${customer.full_name}`}
        mode="create"
        icon={currentView.icon}
      />
      <EstablishmentsForm
        defaultValues={{
          code: "",
          description: "",
          type: "",
          activity_economic: "",
          address: "",
          sede_id: "",
          vincular_sede: false,
          business_partner_id: Number(id),
          district_id: "",
          department_id: "",
          province_id: "",
          location: "",
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
        businessPartnerId={Number(id)}
      />
    </FormWrapper>
  );
}
