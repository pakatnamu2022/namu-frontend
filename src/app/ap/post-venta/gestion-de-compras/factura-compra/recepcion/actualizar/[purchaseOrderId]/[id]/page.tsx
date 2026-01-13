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
import NotFound from "@/app/not-found.tsx";
import {
  findReceptionById,
  updateReception,
} from "@/features/ap/post-venta/gestion-compras/recepciones-producto/lib/receptionsProducts.actions.ts";
import { ReceptionSchema } from "@/features/ap/post-venta/gestion-compras/recepciones-producto/lib/receptionsProducts.schema.ts";
import { ReceptionResource } from "@/features/ap/post-venta/gestion-compras/recepciones-producto/lib/receptionsProducts.interface.ts";
import { ReceptionsProductsForm } from "@/features/ap/post-venta/gestion-compras/recepciones-producto/components/ReceptionsProductsForm.tsx";
import { RECEPTION } from "@/features/ap/post-venta/gestion-compras/recepciones-producto/lib/receptionsProducts.constants.ts";
import { usePurchaseOrderProductsById } from "@/features/ap/post-venta/gestion-compras/factura-compra/lib/purchaseOrderProducts.hook.ts";

export default function UpdateReceptionProductPage() {
  const { id, purchaseOrderId } = useParams<{
    id: string;
    purchaseOrderId: string;
  }>();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { MODEL, QUERY_KEY } = RECEPTION;

  const purchaseOrderIdNum = purchaseOrderId
    ? parseInt(purchaseOrderId)
    : undefined;

  const { data: purchaseOrder, isLoading: isLoadingPurchaseOrder } =
    usePurchaseOrderProductsById(purchaseOrderIdNum || 0);

  const { data: reception, isLoading: loadingReception } = useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findReceptionById(Number(id)),
    refetchOnWindowFocus: false,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ReceptionSchema) => updateReception(Number(id), data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, id],
      });
      router(
        `/ap/post-venta/gestion-de-compras/orden-compra-producto/recepcion/${purchaseOrderId}`
      );
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "update", msg));
    },
  });

  const handleSubmit = (data: ReceptionSchema) => {
    mutate(data);
  };

  function mapReceptionToForm(
    data: ReceptionResource
  ): Partial<ReceptionSchema> {
    return {
      purchase_order_id: String(data.purchase_order_id),
      reception_date: data.reception_date
        ? new Date(data.reception_date)
        : undefined,
      warehouse_id: String(data.warehouse_id),
      freight_cost: data.freight_cost,
      shipping_guide_number: data.shipping_guide_number || "",
      notes: data.notes || "",
      carrier_id: data.carrier ? String(data.carrier.id) : "",
      details:
        data.details?.map((detail) => ({
          purchase_order_item_id: detail.purchase_order_item_id
            ? String(detail.purchase_order_item_id)
            : undefined,
          product_id: String(detail.product_id),
          quantity_received:
            typeof detail.quantity_received === "string"
              ? parseFloat(detail.quantity_received)
              : detail.quantity_received,
          observed_quantity:
            detail.observed_quantity !== undefined &&
            detail.observed_quantity !== null
              ? typeof detail.observed_quantity === "string"
                ? parseFloat(detail.observed_quantity)
                : detail.observed_quantity
              : 0,
          reception_type: detail.reception_type,
          reason_observation: detail.reason_observation || undefined,
          observation_notes: detail.observation_notes || "",
          bonus_reason: detail.bonus_reason || "",
          notes: detail.notes || "",
        })) || [],
    };
  }

  const isLoadingAny =
    loadingReception || !reception || isLoadingPurchaseOrder || !purchaseOrder;

  if (isLoadingAny) {
    return <FormSkeleton />;
  }
  if (!checkRouteExists("orden-compra-producto")) return <NotFound />;
  if (!currentView) return <NotFound />;

  return (
    <FormWrapper>
      <TitleFormComponent
        title={`Editar Recepción - ${purchaseOrder.number}`}
        mode="edit"
        icon="PackageCheck"
      />
      <ReceptionsProductsForm
        defaultValues={mapReceptionToForm(reception)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
        onCancel={() =>
          router(
            `/ap/post-venta/gestion-de-compras/orden-compra-producto/recepcion/${purchaseOrderId}`
          )
        }
        purchaseOrderNumber={purchaseOrder.number}
        purchaseOrderItems={purchaseOrder.items || []}
      />
    </FormWrapper>
  );
}
