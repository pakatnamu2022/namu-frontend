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
  // Calcular gastos de la empresa (is_company_expense = true)
  // Estos NO tienen límite, solo se muestran como información
  const companyExpenses = request.expenses
    ? request.expenses.filter((expense) => expense.is_company_expense)
    : [];

  const totalSpentByCompany = companyExpenses.reduce(
    (sum, expense) => sum + expense.company_amount,
    0
  );

  // Calcular gastos del colaborador (is_company_expense = false)
  // Estos SÍ se comparan contra el presupuesto total
  const employeeExpenses = request.expenses
    ? request.expenses.filter((expense) => !expense.is_company_expense)
    : [];

  const totalSpentByEmployee = employeeExpenses.reduce(
    (sum, expense) => sum + expense.company_amount,
    0
  );

  const employeeSpentPercentage =
    (totalSpentByEmployee / request.total_budget) * 100;

  // Total general (empresa + colaborador)
  const totalGeneral = totalSpentByCompany + totalSpentByEmployee;

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

        {/* Gastos de Empresa (sin límite) */}
        <div className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Gastos de Empresa</p>
          </div>
          <p className="text-xl font-semibold text-blue-600 dark:text-blue-500">
            S/ {totalSpentByCompany.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {companyExpenses.length}{" "}
            {companyExpenses.length === 1 ? "gasto" : "gastos"} registrados
          </p>
        </div>

        {/* Gastos del Colaborador */}
        <div className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              Gastos del Colaborador
            </p>
          </div>
          <p className="text-xl font-semibold mb-2 text-orange-600 dark:text-orange-500">
            S/ {totalSpentByEmployee.toFixed(2)}
          </p>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">
              {employeeSpentPercentage.toFixed(1)}% del presupuesto
            </span>
            <div className="w-full bg-muted rounded-full h-1">
              <div
                className={cn(
                  "h-1 rounded-full transition-all",
                  employeeSpentPercentage > 90
                    ? "bg-destructive"
                    : employeeSpentPercentage > 70
                    ? "bg-orange-500"
                    : "bg-orange-600"
                )}
                style={{
                  width: `${Math.min(employeeSpentPercentage, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Total General */}
        <div className="p-3 bg-muted/30">
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground font-medium">
              Total General
            </p>
          </div>
          <p className="text-xl font-semibold">
            S/ {totalGeneral.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Empresa + Colaborador
          </p>
        </div>

        {/* Por Devolver */}
        <div className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Por Devolver</p>
          </div>
          <p className="text-xl font-semibold text-green-600 dark:text-green-500">
            S/ {request.balance_to_return.toFixed(2)}
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
