import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Banknote,
  CreditCard,
} from "lucide-react";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import type { PerDiemRequestResource } from "../../lib/perDiemRequest.interface";
import { cn } from "@/lib/utils";

interface FinancialSummarySectionProps {
  request: PerDiemRequestResource;
}

export default function FinancialSummarySection({
  request,
}: FinancialSummarySectionProps) {
  // Calcular el total gastado excluyendo gastos de empresa (is_company_expense)
  const totalSpent = request.expenses
    ? request.expenses
        .filter((expense) => !expense.is_company_expense)
        .reduce((sum, expense) => sum + expense.employee_amount, 0)
    : 0;

  const balanceToReturn = request.total_budget - totalSpent;
  const spentPercentage = (totalSpent / request.total_budget) * 100;

  return (
    <GroupFormSection
      title="Resumen Financiero"
      icon={Wallet}
      cols={{ sm: 1 }}
      gap="gap-3"
      className="h-full"
    >
      {/* Montos Principales - Card Agrupado */}
      <div className="border rounded-md divide-y">
        {/* Presupuesto Total */}
        <div className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Presupuesto Total</p>
          </div>
          <p className="text-xl font-semibold">
            S/ {request.total_budget.toFixed(2)}
          </p>
        </div>

        {/* Total Gastado */}
        <div className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Total Gastado</p>
          </div>
          <p className="text-xl font-semibold mb-2">
            S/ {totalSpent.toFixed(2)}
          </p>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">
              {spentPercentage.toFixed(1)}% utilizado
            </span>
            <div className="w-full bg-muted rounded-full h-1">
              <div
                className={cn(
                  "h-1 rounded-full transition-all",
                  spentPercentage > 90
                    ? "bg-destructive"
                    : spentPercentage > 70
                    ? "bg-orange-500"
                    : "bg-primary"
                )}
                style={{ width: `${Math.min(spentPercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Por Devolver */}
        <div className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Por Devolver</p>
          </div>
          <p className="text-xl font-semibold text-green-600 dark:text-green-500">
            S/ {balanceToReturn.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Método de Pago */}
      <div className="border rounded-md p-3 space-y-2.5">
        <p className="text-xs text-muted-foreground">Método de Pago</p>
        {request.cash_amount > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Banknote className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Efectivo</span>
            </div>
            <span className="text-sm font-medium">
              S/ {request.cash_amount.toFixed(2)}
            </span>
          </div>
        )}
        {request.transfer_amount > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Transferencia</span>
            </div>
            <span className="text-sm font-medium">
              S/ {request.transfer_amount.toFixed(2)}
            </span>
          </div>
        )}
      </div>
    </GroupFormSection>
  );
}
