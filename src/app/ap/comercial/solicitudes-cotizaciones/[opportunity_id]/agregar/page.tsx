"use client";

import { useNavigate, useParams } from "react-router-dom";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useMutation } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { PURCHASE_REQUEST_QUOTE } from "@/features/ap/comercial/solicitudes-cotizaciones/lib/purchaseRequestQuote.constants";
import { storePurchaseRequestQuote } from "@/features/ap/comercial/solicitudes-cotizaciones/lib/purchaseRequestQuote.actions";
import { PurchaseRequestQuoteSchema } from "@/features/ap/comercial/solicitudes-cotizaciones/lib/purchaseRequestQuote.schema";
import { PurchaseRequestQuoteForm } from "@/features/ap/comercial/solicitudes-cotizaciones/components/PurchaseRequestQuoteForm";
import { notFound } from "@/shared/hooks/useNotFound";
import { useOpportunity } from "@/features/ap/comercial/oportunidades/lib/opportunities.hook";
import FormSkeleton from "@/shared/components/FormSkeleton";
import PageWrapper from "@/shared/components/PageWrapper";
import { OPPORTUNITIES } from "@/features/ap/comercial/oportunidades/lib/opportunities.constants";

export default function AddPurchaseRequestQuotePage() {
  const router = useNavigate();
  const params = useParams();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL } = PURCHASE_REQUEST_QUOTE;
  const { ABSOLUTE_ROUTE: OPPORTUNITIES_ABSOLUTE_ROUTE } = OPPORTUNITIES;

  const opportunityId = Number(params.opportunity_id);

  const BACK_ROUTE = `${OPPORTUNITIES_ABSOLUTE_ROUTE}/${opportunityId}`;

  // Obtener los datos de la oportunidad
  const { data: opportunity, isLoading: isLoadingOpportunity } =
    useOpportunity(opportunityId);

  const { mutate, isPending } = useMutation({
    mutationFn: storePurchaseRequestQuote,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router(BACK_ROUTE);
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

  if (isLoadingOpportunity) return <FormSkeleton />;
  if (!opportunity) {
    errorToast("No se encontró la oportunidad");
    return notFound();
  }

  return (
    <PageWrapper size="2xl">
      <TitleFormComponent
        title={currentView.descripcion}
        mode="create"
        icon={currentView.icon}
        backRoute={BACK_ROUTE}
      />
      <PurchaseRequestQuoteForm
        defaultValues={{
          sede_id: "",
          type_document: "COTIZACION",
          warranty: "",
          opportunity_id: opportunityId.toString(),
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
        opportunity={opportunity}
        onCancel={() => router(BACK_ROUTE)}
      />
    </PageWrapper>
  );
}
