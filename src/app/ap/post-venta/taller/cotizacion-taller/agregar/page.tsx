"use client";

import { useNavigate } from "react-router-dom";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule.ts";
import { useMutation } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function.ts";
import FormWrapper from "@/shared/components/FormWrapper.tsx";
import TitleFormComponent from "@/shared/components/TitleFormComponent.tsx";
import { notFound } from "@/shared/hooks/useNotFound.ts";
import { ORDER_QUOTATION_TALLER } from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.constants.ts";
import OrderQuotationForm from "@/features/ap/post-venta/taller/cotizacion/components/ProformaForm.tsx";
import { storeOrderQuotation } from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.actions.ts";
import { OrderQuotationSchema } from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.schema.ts";
import { CURRENCY_TYPE_IDS } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.constants.ts";

export default function AddOrderQuotationPage() {
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL, ABSOLUTE_ROUTE } = ORDER_QUOTATION_TALLER;

  const { mutate, isPending } = useMutation({
    mutationFn: storeOrderQuotation,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router(ABSOLUTE_ROUTE!);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: OrderQuotationSchema) => {
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
      <OrderQuotationForm
        defaultValues={{
          vehicle_id: "",
          quotation_date: "",
          expiration_date: "",
          observations: "",
          sede_id: "",
          currency_id: CURRENCY_TYPE_IDS.SOLES,
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
        onCancel={() => router(ABSOLUTE_ROUTE!)}
      />
    </FormWrapper>
  );
}
