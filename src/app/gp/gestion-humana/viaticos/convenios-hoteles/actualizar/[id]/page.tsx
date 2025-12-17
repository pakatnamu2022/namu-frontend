"use client";

import { useNavigate, useParams } from "react-router-dom";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { HotelAgreementForm } from "@/features/gp/gestionhumana/viaticos/convenios-hoteles/components/HotelAgreementForm";
import {
  updateHotelAgreement,
  findHotelAgreementById,
} from "@/features/gp/gestionhumana/viaticos/convenios-hoteles/lib/hotelAgreement.actions";
import { HOTEL_AGREEMENT } from "@/features/gp/gestionhumana/viaticos/convenios-hoteles/lib/hotelAgreement.constants";
import { notFound } from "@/shared/hooks/useNotFound";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { HotelAgreementSchemaUpdate } from "@/features/gp/gestionhumana/viaticos/convenios-hoteles/lib/hotelAgreement.schema";
import FormWrapper from "@/shared/components/FormWrapper";
import { HotelAgreementResource } from "@/features/gp/gestionhumana/viaticos/convenios-hoteles/lib/hotelAgreement.interface";

export default function UpdateHotelAgreementPage() {
  const { id } = useParams();
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { MODEL, ROUTE, ABSOLUTE_ROUTE, QUERY_KEY } = HOTEL_AGREEMENT;

  const {
    data: hotelAgreement,
    isLoading: loadingHotelAgreement,
    error,
  } = useQuery({
    queryKey: [QUERY_KEY, Number(id)],
    queryFn: () => findHotelAgreementById(Number(id)),
    enabled: !!id,
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: HotelAgreementSchemaUpdate) =>
      updateHotelAgreement(Number(id), data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY],
      });
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, Number(id)],
      });
      router(ABSOLUTE_ROUTE!);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "update", msg));
    },
  });

  const handleSubmit = (data: HotelAgreementSchemaUpdate) => {
    mutate(data);
  };

  const handleCancel = () => {
    router(ABSOLUTE_ROUTE!);
  };

  function mapHotelAgreementToForm(
    data: HotelAgreementResource
  ): Partial<HotelAgreementSchemaUpdate> {
    return {
      city: data.city,
      name: data.name,
      corporate_rate: parseFloat(data.corporate_rate),
      features: data.features || "",
      includes_breakfast: data.includes_breakfast,
      includes_lunch: data.includes_lunch,
      includes_dinner: data.includes_dinner,
      includes_parking: data.includes_parking,
      email: data.email,
      phone: data.phone,
      address: data.address,
      website: data.website || "",
      active: data.active,
    };
  }

  if (isLoadingModule || loadingHotelAgreement) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();
  if (error || !hotelAgreement) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="edit"
        icon={currentView.icon}
      />
      <HotelAgreementForm
        defaultValues={mapHotelAgreementToForm(hotelAgreement)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
        onCancel={handleCancel}
      />
    </FormWrapper>
  );
}
