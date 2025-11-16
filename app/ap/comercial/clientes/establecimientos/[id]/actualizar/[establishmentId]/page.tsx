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
import {
  findEstablishmentsById,
  updateEstablishments,
} from "@/src/features/ap/comercial/establecimientos/lib/establishments.actions";
import { EstablishmentsSchema } from "@/src/features/ap/comercial/establecimientos/lib/establishments.schema";
import { EstablishmentsResource } from "@/src/features/ap/comercial/establecimientos/lib/establishments.interface";
import { EstablishmentsForm } from "@/src/features/ap/comercial/establecimientos/components/EstablishmentsForm";
import { CUSTOMERS } from "@/src/features/ap/comercial/clientes/lib/customers.constants";

export default function EditEstablishmentPage() {
  const { id, establishmentId } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { QUERY_KEY, MODEL } = ESTABLISHMENTS;

  const { data: establishment, isLoading: loadingEstablishment } = useQuery({
    queryKey: [QUERY_KEY, establishmentId],
    queryFn: () => findEstablishmentsById(Number(establishmentId)),
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: EstablishmentsSchema) =>
      updateEstablishments(Number(establishmentId), data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY],
      });
      router.push(`/ap/comercial/clientes/establecimientos/${id}`);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "update", msg));
    },
  });

  const handleSubmit = (data: EstablishmentsSchema) => {
    mutate(data);
  };

  function mapEstablishmentToForm(
    data: EstablishmentsResource
  ): Partial<EstablishmentsSchema> {
    return {
      code: data.code,
      description: data.description || "",
      type: data.type,
      activity_economic: data.activity_economic || "",
      address: data.address,
      location: data.location || "",
      business_partner_id: data.business_partner_id,
      sede_id: data.sede_id?.toString() || "",
      department_id: data.department_id?.toString() || "",
      province_id: data.province_id?.toString() || "",
      district_id: data.district_id?.toString() || "",
    };
  }

  const isLoadingAny = loadingEstablishment || !establishment;

  if (isLoadingAny) {
    return <FormSkeleton />;
  }
  if (!checkRouteExists(CUSTOMERS.ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={`Editar Establecimiento - ${establishment.code}`}
        mode="edit"
        icon={currentView.icon}
      />
      <EstablishmentsForm
        defaultValues={mapEstablishmentToForm(establishment)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
        businessPartnerId={establishment.business_partner_id}
      />
    </FormWrapper>
  );
}
