"use client";

import { useNavigate } from "react-router-dom";
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
import { storePurchaseOrderProducts } from "@/features/ap/post-venta/gestion-compras/orden-compra-producto/lib/purchaseOrderProducts.actions";
import { PurchaseOrderProductsSchema } from "@/features/ap/post-venta/gestion-compras/orden-compra-producto/lib/purchaseOrderProducts.schema";
import { PurchaseOrderProductsForm } from "@/features/ap/post-venta/gestion-compras/orden-compra-producto/components/PurchaseOrderProductsForm";
import { PURCHASE_ORDER_PRODUCT } from "@/features/ap/post-venta/gestion-compras/orden-compra-producto/lib/purchaseOrderProducts.constants";

export default function CreatePurchaseOrderProductsPage() {
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL, ABSOLUTE_ROUTE } = PURCHASE_ORDER_PRODUCT;

  const { mutate, isPending } = useMutation({
    mutationFn: storePurchaseOrderProducts,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router(ABSOLUTE_ROUTE!);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: PurchaseOrderProductsSchema) => {
    mutate(data);
  };

  if (!checkRouteExists(ROUTE)) return <NotFound />;
  if (!currentView) return <NotFound />;

  const today = new Date().toISOString().split("T")[0];

  return (
    <FormWrapper>
      <TitleFormComponent
        title={currentView.descripcion}
        mode="create"
        icon={currentView.icon}
      />
      <PurchaseOrderProductsForm
        defaultValues={{
          order_number: "",
          supplier_id: "",
          order_date: today,
          expected_delivery_date: "",
          payment_terms: "",
          shipping_method: "",
          warehouse_id: "",
          subtotal: 0,
          total_discount: 0,
          total_tax: 0,
          total_amount: 0,
          status: "PENDING",
          notes: "",
          items: [],
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
        onCancel={() => router(ROUTE)}
      />
    </FormWrapper>
  );
}
