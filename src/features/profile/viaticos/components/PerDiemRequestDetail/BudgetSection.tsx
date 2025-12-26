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
        {budgets.map((budget) => (
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
                    <p className="text-xs text-muted-foreground mb-0.5">Días</p>
                    <Badge variant="indigo" className="text-xs">
                      {budget.days} {budget.days === 1 ? "día" : "días"}
                    </Badge>
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Total
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
              </div>
            </div>
          </div>
        ))}
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
