"use client";

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
import { storeHotelAgreement } from "@/features/gp/gestionhumana/viaticos/convenios-hoteles/lib/hotelAgreement.actions";
import { HOTEL_AGREEMENT } from "@/features/gp/gestionhumana/viaticos/convenios-hoteles/lib/hotelAgreement.constants";
import { notFound } from "@/shared/hooks/useNotFound";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HotelAgreementSchema } from "@/features/gp/gestionhumana/viaticos/convenios-hoteles/lib/hotelAgreement.schema";
import FormWrapper from "@/shared/components/FormWrapper";
import { useNavigate } from "react-router-dom";

export default function AddHotelAgreementPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { MODEL, ROUTE, ABSOLUTE_ROUTE, QUERY_KEY } = HOTEL_AGREEMENT;

  const { mutate, isPending } = useMutation({
    mutationFn: storeHotelAgreement,
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY],
      });
      router(ABSOLUTE_ROUTE!);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: HotelAgreementSchema) => {
    mutate(data);
  };

  const handleCancel = () => {
    router(ABSOLUTE_ROUTE!);
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="create"
        icon={currentView.icon}
      />
      <HotelAgreementForm
        defaultValues={{
          city: "",
          name: "",
          corporate_rate: 0,
          features: "",
          includes_breakfast: false,
          includes_lunch: false,
          includes_dinner: false,
          includes_parking: false,
          email: "",
          phone: "",
          address: "",
          website: "",
          active: true,
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
        onCancel={handleCancel}
      />
    </FormWrapper>
  );
}
