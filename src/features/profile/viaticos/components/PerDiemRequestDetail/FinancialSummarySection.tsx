import {
  Wallet,
  TrendingUp,
  Building2,
  PlaneTakeoff,
  ArrowDownCircle,
  ReceiptText,
} from "lucide-react";
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
  const {
    total_budget,
    budget_spent,
    total_company,
    extra_spent,
    balance_to_return,
    total_spent_all,
  } = request;

  const budgetPct = total_budget > 0 ? (budget_spent / total_budget) * 100 : 0;
  const budgetColor =
    budgetPct > 90 ? "red" : budgetPct > 70 ? "orange" : "emerald";

  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 gap-4",
        mode === "page" ? "lg:grid-cols-3" : "lg:grid-cols-2",
      )}
    >
      {/* Presupuesto asignado */}
      <DashboardCard
        title="Presupuesto Asignado"
        value={`S/ ${total_budget.toFixed(2)}`}
        description="Monto aprobado para el viático"
        icon={Wallet}
        variant="outline"
        color="blue"
        colorIntensity="600"
        className="gap-0"
      />

      {/* Gastado del presupuesto */}
      <DashboardCard
        title="Gastado del Presupuesto"
        value={`S/ ${budget_spent.toFixed(2)}`}
        description={`${budgetPct.toFixed(1)}% del presupuesto utilizado`}
        icon={TrendingUp}
        variant="outline"
        color={budgetColor}
        colorIntensity="600"
        showProgress
        progressValue={budgetPct}
        progressMax={100}
        className="gap-0"
      />

      {/* Gastos complementarios (pasajes, alojamiento) — solo si hay */}
      {extra_spent > 0 && (
        <DashboardCard
          title="Gastos Complementarios"
          value={`S/ ${extra_spent.toFixed(2)}`}
          description="Pasajes, alojamiento y similares"
          icon={PlaneTakeoff}
          variant="outline"
          color="slate"
          colorIntensity="600"
          className="gap-0"
        />
      )}

      {/* Gastos de empresa — solo si hay */}
      {total_company > 0 && (
        <DashboardCard
          title="Gastos de Empresa"
          value={`S/ ${total_company.toFixed(2)}`}
          description="Pagados directamente por la empresa"
          icon={Building2}
          variant="outline"
          color="blue"
          colorIntensity="600"
          className="gap-0"
        />
      )}

      {/* Saldo a devolver — solo si hay */}
      {balance_to_return > 0 && (
        <DashboardCard
          title="Saldo a Devolver"
          value={`S/ ${balance_to_return.toFixed(2)}`}
          description="Diferencia entre presupuesto y gasto"
          icon={ArrowDownCircle}
          variant="outline"
          color="emerald"
          colorIntensity="600"
          className="gap-0"
        />
      )}

      {/* Total general */}
      <DashboardCard
        title="Total General"
        value={`S/ ${total_spent_all.toFixed(2)}`}
        description="Presupuesto + complementarios + empresa"
        icon={ReceiptText}
        variant="outline"
        className="gap-0"
      />
    </div>
  );
}
