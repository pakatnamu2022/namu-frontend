"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader, Pencil, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { ERROR_MESSAGE, errorToast, successToast } from "@/core/core.function";
import { PlansResource } from "../lib/plans.interface";
import { useAllBudgets } from "@/features/ap/comercial/marketing/presupuestos/lib/budgets.hook";
import { storeBudgets } from "@/features/ap/comercial/marketing/presupuestos/lib/budgets.actions";
import { BudgetsForm } from "@/features/ap/comercial/marketing/presupuestos/components/BudgetsForm";
import { BudgetsSchema } from "@/features/ap/comercial/marketing/presupuestos/lib/budgets.schema";
import {
  BUDGETS,
  BUDGET_TYPE_OPTIONS,
} from "@/features/ap/comercial/marketing/presupuestos/lib/budgets.constants";

interface Props {
  plan: PlansResource | null;
  onOpenChange: (open: boolean) => void;
}

export default function PlanBudgetsModal({ plan, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const [creatingType, setCreatingType] = useState<
    "regular" | "additional" | null
  >(null);

  const {
    data: budgets = [],
    isLoading,
    refetch,
  } = useAllBudgets(plan ? { plan_id: plan.id } : undefined);

  const { mutate, isPending } = useMutation({
    mutationFn: storeBudgets,
    onSuccess: async () => {
      successToast("Presupuesto agregado correctamente");
      setCreatingType(null);
      await queryClient.invalidateQueries({ queryKey: [BUDGETS.QUERY_KEY] });
      await refetch();
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(
        ERROR_MESSAGE({ name: "Presupuesto", gender: true }, "create", msg),
      );
    },
  });

  if (!plan) return null;

  return (
    <Dialog open={!!plan} onOpenChange={(open) => !open && onOpenChange(false)}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Presupuestos de "{plan.name}"</DialogTitle>
          <DialogDescription>
            Los presupuestos regulares y adicionales de este plan se agregan
            aquí.
          </DialogDescription>
        </DialogHeader>

        {creatingType ? (
          <BudgetsForm
            defaultValues={{
              plan_id: plan.id.toString(),
              type: creatingType,
              period_month: "",
              currency_id: "",
              amount_estimated: 0,
              notes: "",
            }}
            onSubmit={(data: BudgetsSchema) => mutate(data)}
            isSubmitting={isPending}
            mode="create"
            planName={plan.name}
            lockType
            hideFooter
            onCancel={() => setCreatingType(null)}
          />
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCreatingType("regular")}
              >
                <Plus className="size-4 mr-2" /> Presupuesto Regular
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCreatingType("additional")}
              >
                <Plus className="size-4 mr-2" /> Presupuesto Adicional
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-6">
                <Loader className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : budgets.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Este plan aún no tiene presupuestos.
              </p>
            ) : (
              <div className="divide-y rounded-md border">
                {budgets.map((budget) => (
                  <div
                    key={budget.id}
                    className="flex items-center justify-between gap-3 p-3 text-sm"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-medium capitalize">
                        {budget.type_label ??
                          (() => {
                            const label = BUDGET_TYPE_OPTIONS.find(
                              (t) => t.value === budget.type,
                            )?.label;
                            return typeof label === "function"
                              ? label()
                              : (label ?? budget.type);
                          })()}
                        {budget.period_month
                          ? ` · Mes ${budget.period_month}`
                          : ""}
                      </span>
                      <span className="text-muted-foreground">
                        {budget.currency?.symbol ?? ""}{" "}
                        {Number(budget.amount_estimated).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="capitalize">
                        {budget.status_label ?? budget.status}
                      </Badge>
                      <Link to={`${BUDGETS.ROUTE_UPDATE}/${budget.id}`}>
                        <Button size="icon-sm" variant="outline">
                          <Pencil className="size-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
