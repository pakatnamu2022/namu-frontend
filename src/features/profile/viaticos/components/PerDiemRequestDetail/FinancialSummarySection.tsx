import { Wallet, TrendingUp } from "lucide-react";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import type { PerDiemRequestResource } from "../../lib/perDiemRequest.interface";
import { cn } from "@/lib/utils";

interface FinancialSummarySectionProps {
  request: PerDiemRequestResource;
  mode?: "sheet" | "page";
}

export default function FinancialSummarySection({
  request,
  mode = "page",
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
      gap="gap-4"
      className="h-full"
    >
      {/* Grid de Cards - Horizontal en desktop, vertical en mobile */}
      <div className={
        cn("grid grid-cols-1 md:grid-cols-2 gap-4", mode === "sheet" ? "lg:grid-cols-2" : "lg:grid-cols-4")
      }>
        {/* Presupuesto Total */}
        <div className="border rounded-md p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground font-medium">
              Presupuesto Total
            </p>
          </div>
          <p className="text-2xl font-bold">
            S/ {request.total_budget.toFixed(2)}
          </p>
        </div>

        {/* Gastos de Empresa */}
        <div className="border rounded-md p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground font-medium">
              Gastos de Empresa
            </p>
          </div>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-500">
            S/ {totalSpentByCompany.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {companyExpenses.length}{" "}
            {companyExpenses.length === 1 ? "gasto" : "gastos"}
          </p>
        </div>

        {/* Gastos del Colaborador */}
        <div className="border rounded-md p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground font-medium">
              Gastos del Colaborador
            </p>
          </div>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-500 mb-2">
            S/ {totalSpentByEmployee.toFixed(2)}
          </p>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">
              {employeeSpentPercentage.toFixed(1)}% del presupuesto
            </span>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div
                className={cn(
                  "h-1.5 rounded-full transition-all",
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
        <div className="border rounded-md p-4 bg-muted/30">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground font-medium">
              Total General
            </p>
          </div>
          <p className="text-2xl font-bold">S/ {totalGeneral.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Empresa + Colaborador
          </p>
        </div>
      </div>
    </GroupFormSection>
  );
}
