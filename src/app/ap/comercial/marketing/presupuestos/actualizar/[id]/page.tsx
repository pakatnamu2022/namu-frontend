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
import { BUDGETS } from "@/features/ap/comercial/marketing/presupuestos/lib/budgets.constants";
import { updateBudgets } from "@/features/ap/comercial/marketing/presupuestos/lib/budgets.actions";
import { useBudgetsById } from "@/features/ap/comercial/marketing/presupuestos/lib/budgets.hook";
import { BudgetsSchema } from "@/features/ap/comercial/marketing/presupuestos/lib/budgets.schema";
import { BudgetsResource } from "@/features/ap/comercial/marketing/presupuestos/lib/budgets.interface";
import { BudgetsForm } from "@/features/ap/comercial/marketing/presupuestos/components/BudgetsForm";
import { notFound } from "@/shared/hooks/useNotFound";

function mapBudgetToForm(data: BudgetsResource): Partial<BudgetsSchema> {
  return {
    plan_id: String(data.plan_id),
    type: data.type,
    period_month: data.period_month ? String(data.period_month) : "",
    currency_id: String(data.currency_id),
    amount_estimated: data.amount_estimated,
    status: data.status ?? "draft",
    notes: data.notes ?? "",
  };
}

export default function UpdateMarketingBudgetPage() {
  const { id } = useParams();
  const router = useNavigate();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, QUERY_KEY, MODEL, ABSOLUTE_ROUTE } = BUDGETS;

  const { data: budget, isLoading: loadingBudget } = useBudgetsById(Number(id));

  const { mutate, isPending } = useMutation({
    mutationFn: (data: BudgetsSchema) => updateBudgets(Number(id), data),
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

  const handleSubmit = (data: BudgetsSchema) => mutate(data);

  if (loadingBudget || !budget) return <FormSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent title={currentView.descripcion} mode="edit" icon={currentView.icon} />
      <BudgetsForm
        defaultValues={mapBudgetToForm(budget)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
      />
    </FormWrapper>
  );
}
