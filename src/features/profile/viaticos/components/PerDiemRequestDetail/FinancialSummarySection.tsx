import { Wallet, TrendingUp } from "lucide-react";
import type { PerDiemRequestResource } from "../../lib/perDiemRequest.interface";
import { cn } from "@/lib/utils";
import { DashboardCard } from "@/components/ui/dashboard-card";

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
    0,
  );

  // Calcular gastos del colaborador (is_company_expense = false)
  // Estos SÍ se comparan contra el presupuesto total
  const employeeExpenses = request.expenses
    ? request.expenses.filter((expense) => !expense.is_company_expense)
    : [];

  const totalSpentByEmployee = employeeExpenses.reduce(
    (sum, expense) => sum + expense.company_amount,
    0,
  );

  const employeeSpentPercentage =
    (totalSpentByEmployee / request.total_budget) * 100;

  // Total general (empresa + colaborador)
  const totalGeneral = totalSpentByCompany + totalSpentByEmployee;

  const employeeProgressColor = employeeSpentPercentage > 90 ? "red" : "orange";

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 gap-4",
        mode === "sheet" ? "lg:grid-cols-2" : "lg:grid-cols-3",
      )}
    >
      <DashboardCard
        title="Gastos de Empresa"
        value={`S/ ${totalSpentByCompany.toFixed(2)}`}
        description={`${companyExpenses.length} ${companyExpenses.length === 1 ? "gasto" : "gastos"}`}
        icon={TrendingUp}
        variant="outline"
        color="blue"
        colorIntensity="600"
        className="gap-0"
      />

      <DashboardCard
        title="Gastos del Colaborador"
        value={`S/ ${totalSpentByEmployee.toFixed(2)}`}
        description={`${employeeSpentPercentage.toFixed(1)}% del presupuesto`}
        icon={TrendingUp}
        variant="outline"
        color={employeeProgressColor}
        colorIntensity="600"
        showProgress
        progressValue={employeeSpentPercentage}
        progressMax={100}
        className="gap-0"
      />

      <DashboardCard
        title="Total General"
        value={`S/ ${totalGeneral.toFixed(2)}`}
        description="Empresa + Colaborador"
        icon={Wallet}
        variant="outline"
        className="gap-0"
      />
    </div>
  );
}
