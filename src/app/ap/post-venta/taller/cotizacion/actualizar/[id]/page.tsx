"use client";

import { useParams } from "react-router-dom";
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
import { ORDER_QUOTATION } from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.constants";
import {
  findOrderQuotationById,
  updateOrderQuotation,
} from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.actions";
import { OrderQuotationSchema } from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.schema";
import { OrderQuotationResource } from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.interface";
import OrderQuotationForm from "@/features/ap/post-venta/taller/cotizacion/components/ProformaForm";
import { notFound } from "@/shared/hooks/useNotFound";

export default function UpdateOrderQuotationPage() {
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, QUERY_KEY, MODEL, ABSOLUTE_ROUTE } = ORDER_QUOTATION;

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
    data: OrderQuotationResource
  ): Partial<OrderQuotationSchema> {
    return {
      vehicle_id: data.vehicle_id ? String(data.vehicle_id) : "",
      quotation_date: data.quotation_date ? new Date(data.quotation_date) : "",
      expiration_date: data.expiration_date
        ? new Date(data.expiration_date)
        : "",
      observations: data.observations || "",
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
      />
    </FormWrapper>
  );
}
