import { Receipt, Calculator } from "lucide-react";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import type { PerDiemRequestResource } from "../../lib/perDiemRequest.interface";
import { Badge } from "@/components/ui/badge";

interface BudgetSectionProps {
  request: PerDiemRequestResource;
}

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
      className="h-full"
    >
      <div className="border rounded-md divide-y">
        {budgets.map((budget) => {
          const spent = budget.spent;
          const remaining = budget.total - spent;
          const spentPercentage = (spent / budget.total) * 100;

          return (
            <div key={budget.id} className="p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      {budget.expense_type.name}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">
                        Monto Diario
                      </p>
                      <p className="font-medium">
                        S/ {budget.daily_amount.toFixed(2)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">
                        Días
                      </p>
                      <Badge variant="indigo" className="text-xs">
                        {budget.days} {budget.days === 1 ? "día" : "días"}
                      </Badge>
                    </div>

                    <div className="col-span-2 md:col-span-1">
                      <p className="text-xs text-muted-foreground mb-0.5">
                        Presupuesto
                      </p>
                      <Badge
                        variant={"blue"}
                        className="font-semibold text-primary"
                      >
                        S/ {budget.total.toFixed(2)}
                      </Badge>
                    </div>
                  </div>

                  {/* Cálculo */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                    <span>
                      S/ {budget.daily_amount.toFixed(2)} × {budget.days}{" "}
                      {budget.days === 1 ? "día" : "días"} = S/{" "}
                      {budget.total.toFixed(2)}
                    </span>
                  </div>

                  {/* Gasto y Restante */}
                  <div className="grid grid-cols-2 gap-3 text-sm pt-2 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">
                        Gastado
                      </p>
                      <p className="font-medium text-orange-600 dark:text-orange-500">
                        S/ {spent.toFixed(2)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">
                        Restante
                      </p>
                      <p
                        className={
                          remaining < 0
                            ? "font-medium text-red-600 dark:text-red-500"
                            : "font-medium text-green-600 dark:text-green-500"
                        }
                      >
                        S/ {remaining.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Barra de progreso */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{spentPercentage.toFixed(1)}% utilizado</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          spentPercentage > 100
                            ? "bg-red-500"
                            : spentPercentage > 90
                            ? "bg-orange-500"
                            : spentPercentage > 70
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{
                          width: `${Math.min(spentPercentage, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resumen Total */}
      <div className="border rounded-md p-3 bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Total Presupuestado</span>
          </div>
          <span className="text-lg font-semibold text-primary">
            S/{" "}
            {budgets.reduce((sum, budget) => sum + budget.total, 0).toFixed(2)}
          </span>
        </div>
      </div>
    </GroupFormSection>
  );
}
