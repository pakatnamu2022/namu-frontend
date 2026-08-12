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
import { BUDGETS } from "@/features/ap/comercial/marketing/presupuestos/lib/budgets.constants";
import { storeBudgets } from "@/features/ap/comercial/marketing/presupuestos/lib/budgets.actions";
import { BudgetsSchema } from "@/features/ap/comercial/marketing/presupuestos/lib/budgets.schema";
import { BudgetsForm } from "@/features/ap/comercial/marketing/presupuestos/components/BudgetsForm";
import { notFound } from "@/shared/hooks/useNotFound";

export default function AddMarketingBudgetPage() {
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();
  const { ROUTE, MODEL, ABSOLUTE_ROUTE } = BUDGETS;

  const { mutate, isPending } = useMutation({
    mutationFn: storeBudgets,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      router(ABSOLUTE_ROUTE!);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleSubmit = (data: BudgetsSchema) => mutate(data);

  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <FormWrapper>
      <TitleFormComponent title={currentView.descripcion} mode="create" icon={currentView.icon} />
      <BudgetsForm
        defaultValues={{
          plan_id: "",
          type: "regular",
          period_month: "",
          currency_id: "",
          amount_estimated: 0,
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
