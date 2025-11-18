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
import NotFound from "@/app/not-found";
import {
  findReceptionById,
  updateReception,
} from "@/features/ap/post-venta/gestion-compras/recepciones-producto/lib/receptions-products.actions";
import { ReceptionSchema } from "@/features/ap/post-venta/gestion-compras/recepciones-producto/lib/receptions-products.schema";
import { ReceptionResource } from "@/features/ap/post-venta/gestion-compras/recepciones-producto/lib/receptions-products.interface";
import { ReceptionsProductsForm } from "@/features/ap/post-venta/gestion-compras/recepciones-producto/components/ReceptionsProductsForm";
import { RECEPTION } from "@/features/ap/post-venta/gestion-compras/recepciones-producto/lib/receptions-products.constants";
import { usePurchaseOrderProductsById } from "@/features/ap/post-venta/gestion-compras/orden-compra-producto/lib/purchaseOrderProducts.hook";

export default function EditReceptionProductPage() {
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
      reception_date: data.reception_date,
      warehouse_id: String(data.warehouse_id),
      supplier_invoice_number: data.supplier_invoice_number,
      supplier_invoice_date: data.supplier_invoice_date,
      shipping_guide_number: data.shipping_guide_number,
      notes: data.notes,
      received_by: data.received_by ? String(data.received_by) : "",
      details:
        data.details?.map((detail) => ({
          purchase_order_item_id: detail.purchase_order_item_id
            ? String(detail.purchase_order_item_id)
            : "",
          product_id: String(detail.product_id),
          quantity_received: detail.quantity_received,
          quantity_accepted: detail.quantity_accepted,
          quantity_rejected: detail.quantity_rejected,
          reception_type: detail.reception_type,
          unit_cost: detail.unit_cost,
          is_charged: detail.is_charged,
          rejection_reason: detail.rejection_reason,
          rejection_notes: detail.rejection_notes,
          bonus_reason: detail.bonus_reason,
          batch_number: detail.batch_number,
          expiration_date: detail.expiration_date,
          notes: detail.notes,
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
        title={`Editar Recepción - ${purchaseOrder.order_number}`}
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
        purchaseOrderNumber={purchaseOrder.order_number}
      />
    </FormWrapper>
  );
}
