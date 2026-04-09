import { Receipt, Calculator } from "lucide-react";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import type { PerDiemRequestResource } from "../../lib/perDiemRequest.interface";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface BudgetSectionProps {
  request: PerDiemRequestResource;
}

const getBudgetStatus = (pct: number) => {
  if (pct > 100) return { label: "Excedido",     color: "red"    as const, indicator: "bg-red-500"    };
  if (pct > 90)  return { label: "Casi agotado", color: "orange" as const, indicator: "bg-orange-500" };
  if (pct > 70)  return { label: "Por agotar",   color: "yellow" as const, indicator: "bg-yellow-500" };
  return           { label: "Disponible",     color: "green"  as const, indicator: "bg-green-500"  };
};

export default function BudgetSection({ request }: BudgetSectionProps) {
  const budgets = request.budgets || [];

  if (budgets.length === 0) {
    return null;
  }

  return (
    <GroupFormSection
      title="Detalle de Presupuesto"
      icon={Receipt}
      cols={{ sm: 1 }}
      gap="gap-3"
    >
      <div className="border rounded-md divide-y">
        {budgets.map((budget) => {
          const spent = budget.spent;
          const remaining = budget.total - spent;
          const spentPercentage = (spent / budget.total) * 100;
          const budgetStatus = getBudgetStatus(spentPercentage);

          return (
            <div key={budget.id} className="p-4">
              <div className="flex items-start gap-4">

                {/* IZQUIERDA: descripción + progreso */}
                <div className="flex-1 min-w-0 space-y-3">

                  {/* Nombre + badge de estado inline */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Calculator className="h-4 w-4 text-muted-foreground shrink-0" />
                    <p className="text-sm font-semibold">{budget.expense_type.name}</p>
                    <Badge color={budgetStatus.color} size="sm">{budgetStatus.label}</Badge>
                  </div>

                  {/* Fórmula como contexto inline */}
                  <p className="text-xs text-muted-foreground">
                    S/ {budget.daily_amount.toFixed(2)} × {budget.days}{" "}
                    {budget.days === 1 ? "día" : "días"} ={" "}
                    <span className="font-medium text-foreground">
                      S/ {budget.total.toFixed(2)}
                    </span>{" "}
                    presupuestado
                  </p>

                  {/* Gastado con contexto "de total" */}
                  <div className="flex items-baseline gap-1.5 text-sm">
                    <span className="font-semibold text-orange-600 dark:text-orange-500">
                      S/ {spent.toFixed(2)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      gastado de S/ {budget.total.toFixed(2)}
                    </span>
                  </div>

                  {/* Barra de progreso */}
                  <div className="space-y-1">
                    <Progress
                      value={Math.min(spentPercentage, 100)}
                      className="h-3"
                      indicatorClassName={budgetStatus.indicator}
                    />
                    <p className="text-xs text-muted-foreground">
                      {spentPercentage.toFixed(1)}% utilizado
                    </p>
                  </div>
                </div>

                {/* DERECHA: saldo restante como foco principal */}
                <div className="shrink-0 text-right flex flex-col items-end gap-1.5 pt-0.5">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                    Restante
                  </p>
                  <p
                    className={
                      remaining < 0
                        ? "text-xl font-bold text-red-600 dark:text-red-500"
                        : "text-xl font-bold text-green-600 dark:text-green-500"
                    }
                  >
                    S/ {Math.abs(remaining).toFixed(2)}
                  </p>
                  {remaining < 0 && (
                    <p className="text-xs text-red-500">sobre el límite</p>
                  )}
                  <Badge color="indigo" size="sm">
                    {budget.days} {budget.days === 1 ? "día" : "días"}
                  </Badge>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Resumen Total */}
      <div className="border rounded-md p-3 bg-muted/50">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Total Presupuestado</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              Gastado:{" "}
              <span className="font-medium text-orange-600 dark:text-orange-500">
                S/ {budgets.reduce((sum, b) => sum + b.spent, 0).toFixed(2)}
              </span>
            </span>
            <span className="text-lg font-semibold text-primary">
              S/ {budgets.reduce((sum, b) => sum + b.total, 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </GroupFormSection>
  );
}
