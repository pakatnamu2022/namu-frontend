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
import { MARKETING_PURCHASE_ORDERS } from "@/features/ap/comercial/marketing/ordenes-compra/lib/purchaseOrders.constants";
import { storePurchaseOrders } from "@/features/ap/comercial/marketing/ordenes-compra/lib/purchaseOrders.actions";
import { PurchaseOrdersSchema } from "@/features/ap/comercial/marketing/ordenes-compra/lib/purchaseOrders.schema";
import { PurchaseOrdersForm } from "@/features/ap/comercial/marketing/ordenes-compra/components/PurchaseOrdersForm";
import { notFound } from "@/shared/hooks/useNotFound";

export default function AddMarketingPurchaseOrderPage() {
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL, ABSOLUTE_ROUTE } = MARKETING_PURCHASE_ORDERS;

  const { mutate, isPending } = useMutation({
    mutationFn: storePurchaseOrders,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router(ABSOLUTE_ROUTE!);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: PurchaseOrdersSchema) => mutate(data);

  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent title={currentView.descripcion} mode="create" icon={currentView.icon} />
      <PurchaseOrdersForm
        defaultValues={{
          activity_id: "",
          proposal_id: "",
          supplier_id: "",
          currency_id: "",
          number: "",
          amount: 0,
          issue_date: "",
          status: "draft",
          notes: "",
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
      />
    </FormWrapper>
  );
}
