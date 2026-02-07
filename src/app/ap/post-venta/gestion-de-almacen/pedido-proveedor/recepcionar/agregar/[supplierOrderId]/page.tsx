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
import PageSkeleton from "@/shared/components/PageSkeleton.tsx";
import { useSupplierOrderById } from "@/features/ap/post-venta/gestion-almacen/pedido-proveedor/lib/supplierOrder.hook";
import { SUPPLIER_ORDER } from "@/features/ap/post-venta/gestion-almacen/pedido-proveedor/lib/supplierOrder.constants";

export default function AddReceptionProductPage() {
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { MODEL, ABSOLUTE_ROUTE } = RECEPTION;
  const { ROUTE } = SUPPLIER_ORDER;
  const { supplierOrderId } = useParams<{ supplierOrderId: string }>();
  const supplierOrderIdNum = supplierOrderId
    ? parseInt(supplierOrderId)
    : undefined;

  const { data: supplierOrder, isLoading: isLoadingPurchaseOrder } =
    useSupplierOrderById(supplierOrderIdNum || 0);

  const { mutate, isPending } = useMutation({
    mutationFn: storeReception,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router(`${ABSOLUTE_ROUTE}/${supplierOrderId}`);
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
  if (!supplierOrder) return <NotFound />;

  const today = new Date();

  return (
    <FormWrapper>
      <TitleFormComponent
        title={`Nueva Recepción - ${supplierOrder.order_number}`}
        mode="create"
        icon="PackageCheck"
      />
      <ReceptionsProductsForm
        defaultValues={{
          ap_supplier_order_id: supplierOrderId || "",
          reception_date: today,
          warehouse_id: supplierOrder.warehouse_id?.toString() || "",
          freight_cost: undefined,
          shipping_guide_number: "",
          notes: "",
          carrier_id: "",
          details: [],
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
        onCancel={() => router(`${ABSOLUTE_ROUTE}/${supplierOrderId}`)}
        supplierOrderNumber={supplierOrder.order_number}
        supplierOrderItems={supplierOrder.details}
      />
    </FormWrapper>
  );
}
