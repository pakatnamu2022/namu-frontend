"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { notFound } from "@/shared/hooks/useNotFound";
import { useNavigate, useParams } from "react-router-dom";
import { ORDER_QUOTATION_MESON } from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.constants";
import ProformaMesonForm from "@/features/ap/post-venta/repuestos/cotizacion-meson/components/ProformaMesonForm";
import { QuotationMesonWithProductsSchema } from "@/features/ap/post-venta/repuestos/cotizacion-meson/lib/quotationMeson.schema";
import { updateOrderQuotationWithProducts } from "@/features/ap/post-venta/repuestos/cotizacion-meson/lib/quotationMeson.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { useState } from "react";
import { useOrderQuotationById } from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.hook";
import { useQueryClient } from "@tanstack/react-query";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import FormWrapper from "@/shared/components/FormWrapper";

export default function UpdateOrderQuotationMesonPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const { MODEL, ROUTE, ABSOLUTE_ROUTE, QUERY_KEY } = ORDER_QUOTATION_MESON;
  const router = useNavigate();
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const { data: quotation, isLoading: isLoadingQuotation } =
    useOrderQuotationById(Number(id));

  const handleSubmit = async (data: QuotationMesonWithProductsSchema) => {
    try {
      setIsSubmitting(true);

      await updateOrderQuotationWithProducts(Number(id), data);

      // Invalidar la caché para refrescar los datos
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, Number(id)] });

      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      router(ABSOLUTE_ROUTE);
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "update", msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router(ABSOLUTE_ROUTE);
  };

  if (isLoadingModule || isLoadingQuotation) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();
  if (!quotation) notFound();

  const defaultValues = {
    area_id: quotation.area_id?.toString() || "",
    sede_id: quotation.sede_id?.toString() || "",
    vehicle_id: quotation.vehicle_id?.toString() || "",
    client_id: quotation.client?.id?.toString() || "",
    quotation_date: quotation.quotation_date
      ? new Date(quotation.quotation_date)
      : "",
    expiration_date: quotation.expiration_date
      ? new Date(quotation.expiration_date)
      : "",
    collection_date: quotation.collection_date
      ? new Date(quotation.collection_date)
      : "",
    observations: quotation.observations || "",
    currency_id: quotation.currency_id?.toString() || "",
    supply_type: quotation.supply_type || "STOCK",
    details:
      quotation.details
        ?.filter((d) => d.item_type === "PRODUCT")
        .map((detail) => ({
          product_id: detail.product_id?.toString() || "",
          description: detail.description || "",
          quantity: Number(detail.quantity) || 0,
          unit_measure: detail.unit_measure || "",
          unit_price: Number(detail.unit_price) || 0,
          discount_percentage: Number(detail.discount_percentage) || 0,
          total_amount: Number(detail.total_amount) || 0,
          observations: detail.observations || "",
          retail_price_external: Number(detail.retail_price_external) || 0,
          exchange_rate: Number(detail.exchange_rate) || 0,
          freight_commission: Number(detail.freight_commission) || 1.05,
        })) || [],
  };

  return (
    <FormWrapper>
      <TitleFormComponent
        title="Editar Cotización"
        mode="edit"
        icon={currentView.icon}
      />

      <ProformaMesonForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        mode="update"
        onCancel={handleCancel}
        vehicleData={quotation.vehicle}
        clientData={quotation.client}
        quotationData={quotation}
      />
    </FormWrapper>
  );
}
