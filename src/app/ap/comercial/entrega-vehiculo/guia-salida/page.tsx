"use client";

import { useNavigate } from "react-router-dom";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import FormWrapper from "@/shared/components/FormWrapper";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { VEHICLE_DELIVERY } from "@/features/ap/comercial/entrega-vehiculo/lib/vehicleDelivery.constants";
import { useStoreStockInicialDelivery } from "@/features/ap/comercial/entrega-vehiculo/lib/exitGuide.hook";
import { ExitGuideForm } from "@/features/ap/comercial/entrega-vehiculo/components/ExitGuideForm";
import { ExitGuideSchema } from "@/features/ap/comercial/entrega-vehiculo/lib/exitGuide.schema";
import { notFound } from "@/shared/hooks/useNotFound";
import { format } from "date-fns";

export default function ExitGuidePage() {
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL, ABSOLUTE_ROUTE } = VEHICLE_DELIVERY;

  const { mutate, isPending } = useStoreStockInicialDelivery();

  const handleSubmit = (data: ExitGuideSchema) => {
    const formattedData = {
      ...data,
      scheduled_delivery_date: format(
        data.scheduled_delivery_date,
        "yyyy-MM-dd HH:mm:ss",
      ),
    };
    mutate(formattedData, {
      onSuccess: () => {
        successToast(SUCCESS_MESSAGE(MODEL, "create"));
        router(ABSOLUTE_ROUTE);
      },
      onError: (error: any) => {
        const msg = error?.response?.data?.message || "";
        errorToast(ERROR_MESSAGE(MODEL, "create", msg));
      },
    });
  };

  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent
        title="Guía de Salida"
        mode="create"
        icon="Truck"
      />
      <ExitGuideForm
        defaultValues={{
          ap_class_article_id: "",
          sede_id: "",
          client_id: "",
          vehicle_id: "",
          advisor_id: "",
          observations: "",
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        onCancel={() => router(ABSOLUTE_ROUTE)}
      />
    </FormWrapper>
  );
}
