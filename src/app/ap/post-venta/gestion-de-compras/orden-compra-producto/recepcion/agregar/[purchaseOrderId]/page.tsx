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
import FormWrapper from "@/shared/components/FormWrapper";
import NotFound from "@/app/not-found";
import { storeReception } from "@/features/ap/post-venta/gestion-compras/recepciones-producto/lib/receptions-products.actions";
import { ReceptionSchema } from "@/features/ap/post-venta/gestion-compras/recepciones-producto/lib/receptions-products.schema";
import { ReceptionsProductsForm } from "@/features/ap/post-venta/gestion-compras/recepciones-producto/components/ReceptionsProductsForm";
import { RECEPTION } from "@/features/ap/post-venta/gestion-compras/recepciones-producto/lib/receptions-products.constants";
import { usePurchaseOrderProductsById } from "@/features/ap/post-venta/gestion-compras/orden-compra-producto/lib/purchaseOrderProducts.hook";
import PageSkeleton from "@/shared/components/PageSkeleton";

export default function CreateReceptionProductPage() {
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { MODEL } = RECEPTION;
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
      router(
        `/ap/post-venta/gestion-de-compras/orden-compra-producto/recepcion/${purchaseOrderId}`
      );
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
  if (!checkRouteExists("orden-compra-producto")) return <NotFound />;
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
          shipping_guide_number: "",
          notes: "",
          details: [],
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
        onCancel={() =>
          router(
            `/ap/post-venta/gestion-de-compras/orden-compra-producto/recepcion/${purchaseOrderId}`
          )
        }
        purchaseOrderNumber={purchaseOrder.number}
        purchaseOrderItems={purchaseOrder.items}
      />
    </FormWrapper>
  );
}
