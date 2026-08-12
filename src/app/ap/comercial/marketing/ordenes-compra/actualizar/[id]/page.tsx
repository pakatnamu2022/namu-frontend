"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { MARKETING_PURCHASE_ORDERS } from "@/features/ap/comercial/marketing/ordenes-compra/lib/purchaseOrders.constants";
import { updatePurchaseOrders } from "@/features/ap/comercial/marketing/ordenes-compra/lib/purchaseOrders.actions";
import { usePurchaseOrdersById } from "@/features/ap/comercial/marketing/ordenes-compra/lib/purchaseOrders.hook";
import { PurchaseOrdersSchema } from "@/features/ap/comercial/marketing/ordenes-compra/lib/purchaseOrders.schema";
import { PurchaseOrdersResource } from "@/features/ap/comercial/marketing/ordenes-compra/lib/purchaseOrders.interface";
import { PurchaseOrdersForm } from "@/features/ap/comercial/marketing/ordenes-compra/components/PurchaseOrdersForm";
import { notFound } from "@/shared/hooks/useNotFound";

function mapOrderToForm(data: PurchaseOrdersResource): Partial<PurchaseOrdersSchema> {
  return {
    activity_id: data.activity_id ? String(data.activity_id) : "",
    proposal_id: data.proposal_id ? String(data.proposal_id) : "",
    supplier_id: String(data.supplier_id),
    currency_id: String(data.currency_id),
    number: data.number ?? "",
    amount: data.amount,
    issue_date: data.issue_date ?? "",
    status: data.status ?? "draft",
    notes: data.notes ?? "",
  };
}

export default function UpdateMarketingPurchaseOrderPage() {
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, QUERY_KEY, MODEL, ABSOLUTE_ROUTE } = MARKETING_PURCHASE_ORDERS;

  const { data: order, isLoading: loadingOrder } = usePurchaseOrdersById(Number(id));

  const { mutate, isPending } = useMutation({
    mutationFn: (data: PurchaseOrdersSchema) => updatePurchaseOrders(Number(id), data),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      router(ABSOLUTE_ROUTE!);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "update", msg));
    },
  });

  const handleSubmit = (data: PurchaseOrdersSchema) => mutate(data);

  if (loadingOrder || !order) return <FormSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent title={currentView.descripcion} mode="edit" icon={currentView.icon} />
      <PurchaseOrdersForm
        defaultValues={mapOrderToForm(order)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
        statusLabel={order.status_label}
      />
    </FormWrapper>
  );
}
