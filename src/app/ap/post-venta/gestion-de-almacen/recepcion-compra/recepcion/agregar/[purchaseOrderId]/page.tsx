"use client";

import { useNavigate, useParams } from "react-router-dom";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule.ts";
import { useMutation } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function.ts";
import TitleFormComponent from "@/shared/components/TitleFormComponent.tsx";
import FormWrapper from "@/shared/components/FormWrapper.tsx";
import NotFound from "@/app/not-found.tsx";
import { storeReception } from "@/features/ap/post-venta/gestion-almacen/recepciones-producto/lib/receptionsProducts.actions.ts";
import { ReceptionSchema } from "@/features/ap/post-venta/gestion-almacen/recepciones-producto/lib/receptionsProducts.schema.ts";
import { ReceptionsProductsForm } from "@/features/ap/post-venta/gestion-almacen/recepciones-producto/components/ReceptionsProductsForm.tsx";
import { RECEPTION } from "@/features/ap/post-venta/gestion-almacen/recepciones-producto/lib/receptionsProducts.constants.ts";
import { usePurchaseOrderProductsById } from "@/features/ap/post-venta/gestion-almacen/recepcion-compra/lib/purchaseOrderProducts.hook.ts";
import PageSkeleton from "@/shared/components/PageSkeleton.tsx";
import { PURCHASE_ORDER_PRODUCT } from "@/features/ap/post-venta/gestion-almacen/recepcion-compra/lib/purchaseOrderProducts.constants.ts";

export default function AddReceptionProductPage() {
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { MODEL, ABSOLUTE_ROUTE } = RECEPTION;
  const { ROUTE } = PURCHASE_ORDER_PRODUCT;
  const { purchaseOrderId } = useParams<{ purchaseOrderId: string }>();
  const purchaseOrderIdNum = purchaseOrderId
    ? parseInt(purchaseOrderId)
    : undefined;

  const { data: purchaseOrder, isLoading: isLoadingPurchaseOrder } =
    usePurchaseOrderProductsById(purchaseOrderIdNum || 0);

  const { mutate, isPending } = useMutation({
    mutationFn: storeReception,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router(`${ABSOLUTE_ROUTE}/${purchaseOrderId}`);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: ReceptionSchema) => {
    mutate(data);
  };

  if (isLoadingPurchaseOrder) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) return <NotFound />;
  if (!currentView) return <NotFound />;
  if (!purchaseOrder) return <NotFound />;

  const today = new Date();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={`Nueva Recepción - ${purchaseOrder.number}`}
        mode="create"
        icon="PackageCheck"
      />
      <ReceptionsProductsForm
        defaultValues={{
          purchase_order_id: purchaseOrderId || "",
          reception_date: today,
          warehouse_id: purchaseOrder.warehouse_id?.toString() || "",
          freight_cost: 0,
          shipping_guide_number: "",
          notes: "",
          carrier_id: "",
          details: [],
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
        onCancel={() => router(`${ABSOLUTE_ROUTE}/${purchaseOrderId}`)}
        purchaseOrderNumber={purchaseOrder.number}
        purchaseOrderItems={purchaseOrder.items}
      />
    </FormWrapper>
  );
}
