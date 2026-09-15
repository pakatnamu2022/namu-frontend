"use client";

import { useNavigate, useSearchParams } from "react-router-dom";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import FormWrapper from "@/shared/components/FormWrapper";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { MARKETING_PURCHASE_ORDERS } from "@/features/ap/comercial/marketing/ordenes-compra/lib/purchaseOrders.constants";
import { storePurchaseOrders } from "@/features/ap/comercial/marketing/ordenes-compra/lib/purchaseOrders.actions";
import { PurchaseOrdersSchema } from "@/features/ap/comercial/marketing/ordenes-compra/lib/purchaseOrders.schema";
import { PurchaseOrdersForm } from "@/features/ap/comercial/marketing/ordenes-compra/components/PurchaseOrdersForm";
import { usePlansById } from "@/features/ap/comercial/marketing/planes/lib/plans.hook";
import { notFound } from "@/shared/hooks/useNotFound";

export default function AddMarketingPurchaseOrderPage() {
  const router = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, QUERY_KEY, MODEL, ABSOLUTE_ROUTE } = MARKETING_PURCHASE_ORDERS;

  const planId = Number(searchParams.get("plan_id") ?? 0);
  const { data: plan, isLoading: loadingPlan } = usePlansById(planId);

  const { mutate, isPending } = useMutation({
    mutationFn: storePurchaseOrders,
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      router(ABSOLUTE_ROUTE!);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: PurchaseOrdersSchema, file: File | null) =>
    mutate({ ...data, file });

  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();
  if (planId > 0 && loadingPlan) return <FormSkeleton />;

  return (
    <FormWrapper>
      <TitleFormComponent title={currentView.descripcion} mode="create" icon={currentView.icon} />
      <PurchaseOrdersForm
        defaultValues={{
          plan_id: planId > 0 ? String(planId) : "",
          activity_id: "",
          proposal_id: "",
          supplier_id: "",
          currency_id: "",
          number: "",
          reference: "",
          amount: 0,
          issue_date: "",
          status: "draft",
          notes: plan?.concept ?? plan?.description ?? "",
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
        planName={plan?.name}
        planBrandName={plan?.brand?.name}
      />
    </FormWrapper>
  );
}
