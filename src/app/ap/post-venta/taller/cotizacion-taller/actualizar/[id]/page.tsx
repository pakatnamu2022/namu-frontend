"use client";

import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule.ts";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function.ts";
import TitleFormComponent from "@/shared/components/TitleFormComponent.tsx";
import FormSkeleton from "@/shared/components/FormSkeleton.tsx";
import FormWrapper from "@/shared/components/FormWrapper.tsx";
import { ORDER_QUOTATION_TALLER } from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.constants.ts";
import {
  findOrderQuotationById,
  updateOrderQuotation,
} from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.actions.ts";
import { OrderQuotationSchema } from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.schema.ts";
import { OrderQuotationResource } from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.interface.ts";
import OrderQuotationForm from "@/features/ap/post-venta/taller/cotizacion/components/ProformaForm.tsx";
import { notFound } from "@/shared/hooks/useNotFound.ts";

export default function UpdateOrderQuotationPage() {
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, QUERY_KEY, MODEL, ABSOLUTE_ROUTE } = ORDER_QUOTATION_TALLER;

  const { data: orderQuotation, isLoading: loadingOrderQuotation } = useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findOrderQuotationById(Number(id)),
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: OrderQuotationSchema) =>
      updateOrderQuotation(Number(id), data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, id],
      });
      router(ABSOLUTE_ROUTE!);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "update", msg));
    },
  });

  const handleSubmit = (data: OrderQuotationSchema) => {
    mutate(data);
  };

  function mapOrderQuotationToForm(
    data: OrderQuotationResource,
  ): Partial<OrderQuotationSchema> {
    return {
      client_id: data.client.id ? String(data.client.id) : "",
      vehicle_id: data.vehicle_id ? String(data.vehicle_id) : "",
      quotation_date: data.quotation_date ? new Date(data.quotation_date) : "",
      expiration_date: data.expiration_date
        ? new Date(data.expiration_date)
        : "",
      observations: data.observations || "",
      sede_id: data.sede_id ? String(data.sede_id) : "",
      area_id: data.area_id ? String(data.area_id) : "",
      currency_id: data.currency_id ? String(data.currency_id) : "",
    };
  }

  const isLoadingAny = loadingOrderQuotation || !orderQuotation;

  if (isLoadingAny) {
    return <FormSkeleton />;
  }
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="edit"
        icon={currentView.icon}
      />
      <OrderQuotationForm
        defaultValues={mapOrderQuotationToForm(orderQuotation)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
        onCancel={() => router(ABSOLUTE_ROUTE!)}
        proforma={orderQuotation}
      />
    </FormWrapper>
  );
}
