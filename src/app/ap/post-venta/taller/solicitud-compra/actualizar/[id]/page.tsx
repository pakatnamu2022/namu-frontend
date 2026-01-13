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
import { PURCHASE_REQUEST } from "@/features/ap/post-venta/taller/solicitud-compra/lib/purchaseRequest.constants";
import {
  findPurchaseRequestById,
  updatePurchaseRequest,
} from "@/features/ap/post-venta/taller/solicitud-compra/lib/purchaseRequest.actions";
import { PurchaseRequestSchema } from "@/features/ap/post-venta/taller/solicitud-compra/lib/purchaseRequest.schema";
import { PurchaseRequestResource } from "@/features/ap/post-venta/taller/solicitud-compra/lib/purchaseRequest.interface";
import PurchaseRequestForm from "@/features/ap/post-venta/taller/solicitud-compra/components/PurchaseRequestForm";
import { notFound } from "@/shared/hooks/useNotFound";

export default function UpdatePurchaseRequestPVPage() {
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, QUERY_KEY, MODEL, ABSOLUTE_ROUTE } = PURCHASE_REQUEST;

  const { data: purchaseRequest, isLoading: loadingPurchaseRequest } = useQuery(
    {
      queryKey: [QUERY_KEY, id],
      queryFn: () => findPurchaseRequestById(Number(id)),
      refetchOnWindowFocus: false,
    }
  );

  const { mutate, isPending } = useMutation({
    mutationFn: (data: PurchaseRequestSchema) =>
      updatePurchaseRequest(Number(id), data),
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

  const handleSubmit = (data: PurchaseRequestSchema) => {
    mutate(data);
  };

  function mapPurchaseRequestToForm(
    data: PurchaseRequestResource
  ): Partial<PurchaseRequestSchema> {
    return {
      ap_order_quotation_id: data.ap_order_quotation_id
        ? String(data.ap_order_quotation_id)
        : undefined,
      warehouse_id: String(data.warehouse_id),
      observations: data.observations || "",
      requested_date: data.requested_date
        ? new Date(data.requested_date)
        : new Date(),
      has_appointment: !!data.ap_order_quotation_id,
      supply_type: data.supply_type,
      details: (data.details || []).map((detail) => ({
        product_id: String(detail.product_id),
        quantity: detail.quantity,
        notes: detail.notes || undefined,
        product_name: detail.product?.name || "",
        product_code: detail.product?.code || "",
      })),
    };
  }

  const isLoadingAny = loadingPurchaseRequest || !purchaseRequest;

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
      <PurchaseRequestForm
        defaultValues={mapPurchaseRequestToForm(purchaseRequest)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
        onCancel={() => router(ABSOLUTE_ROUTE!)}
      />
    </FormWrapper>
  );
}
