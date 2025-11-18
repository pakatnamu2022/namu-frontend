"use client";

import { useNavigate } from 'react-router-dom';
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useMutation } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import FormWrapper from "@/shared/components/FormWrapper";
import { PURCHASE_REQUEST_QUOTE } from "@/features/ap/comercial/solicitudes-cotizaciones/lib/purchaseRequestQuote.constants";
import { storePurchaseRequestQuote } from "@/features/ap/comercial/solicitudes-cotizaciones/lib/purchaseRequestQuote.actions";
import { PurchaseRequestQuoteSchema } from "@/features/ap/comercial/solicitudes-cotizaciones/lib/purchaseRequestQuote.schema";
import { PurchaseRequestQuoteForm } from "@/features/ap/comercial/solicitudes-cotizaciones/components/PurchaseRequestQuoteForm";
import { notFound } from "@/shared/hooks/useNotFound";


export default function AddPurchaseRequestQuotePage() {
  const router = useNavigate();
    const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL } = PURCHASE_REQUEST_QUOTE;

  const { mutate, isPending } = useMutation({
    mutationFn: storePurchaseRequestQuote,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router("./");
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: PurchaseRequestQuoteSchema) => {
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
      <PurchaseRequestQuoteForm
        defaultValues={{
          sede_id: "",
          type_document: "COTIZACION",
          warranty: "",
          opportunity_id: "",
          comment: "",
          holder_id: "",
          with_vin: false,
          vehicle_color_id: "",
          ap_models_vn_id: "",
          ap_vehicle_id: "",
          sale_price: "0",
          doc_type_currency_id: "",
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
      />
    </FormWrapper>
  );
}
