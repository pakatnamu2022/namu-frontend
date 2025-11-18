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
import { PURCHASE_REQUEST_QUOTE } from "@/features/ap/comercial/solicitudes-cotizaciones/lib/purchaseRequestQuote.constants";
import {
  findPurchaseRequestQuoteById,
  updatePurchaseRequestQuote,
} from "@/features/ap/comercial/solicitudes-cotizaciones/lib/purchaseRequestQuote.actions";
import { PurchaseRequestQuoteSchema } from "@/features/ap/comercial/solicitudes-cotizaciones/lib/purchaseRequestQuote.schema";
import { PurchaseRequestQuoteResource } from "@/features/ap/comercial/solicitudes-cotizaciones/lib/purchaseRequestQuote.interface";
import { PurchaseRequestQuoteForm } from "@/features/ap/comercial/solicitudes-cotizaciones/components/PurchaseRequestQuoteForm";
import NotFound from '@/app/not-found';


export default function UpdatePurchaseRequestQuotePage() {
    const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, QUERY_KEY, MODEL } = PURCHASE_REQUEST_QUOTE;

  const { data: PurchaseRequestQuote, isLoading: loadingPurchaseRequestQuote } =
    useQuery({
      queryKey: [QUERY_KEY, id],
      queryFn: () => findPurchaseRequestQuoteById(Number(id)),
      refetchOnWindowFocus: false,
    });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: PurchaseRequestQuoteSchema) =>
      updatePurchaseRequestQuote(Number(id), data),
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

  const handleSubmit = (data: PurchaseRequestQuoteSchema) => {
    mutate(data);
  };

  function mapPurchaseRequestQuoteToForm(
    data: PurchaseRequestQuoteResource
  ): any {
    return {
      sede_id: String(data.sede_id),
      type_document: data.type_document,
      opportunity_id: String(data.opportunity_id || ""),
      holder_id: String(data.holder_id),
      with_vin: !!data.ap_vehicle_id,
      vehicle_color_id: String(data.vehicle_color_id || ""),
      ap_models_vn_id: String(data.ap_models_vn_id || ""),
      ap_vehicle_id: data.ap_vehicle_id?.toString(),
      sale_price: data.base_selling_price?.toString() || "0",
      doc_type_currency_id: data.doc_type_currency_id?.toString(),
      comment: data.comment || "",
      warranty: data.warranty || "",
      // Pasar los arrays tal como vienen del API
      bonus_discounts: data.bonus_discounts || [],
      accessories: data.accessories || [],
    };
  }

  const isLoadingAny = loadingPurchaseRequestQuote || !PurchaseRequestQuote;

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
      <PurchaseRequestQuoteForm
        defaultValues={mapPurchaseRequestQuoteToForm(PurchaseRequestQuote)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
      />
    </FormWrapper>
  );
}
