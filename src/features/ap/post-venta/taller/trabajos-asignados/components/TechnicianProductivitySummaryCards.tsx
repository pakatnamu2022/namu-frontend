"use client";

import { Clock, TrendingUp, Wallet, Wrench } from "lucide-react";
import { MetricCard } from "@/shared/components/MetricCard";
import { formatHours, formatMoney } from "@/core/core.function";
import {
  TechnicianProductivityPeriod,
  TechnicianProductivitySummary,
} from "../lib/technicianProductivity.interface";

interface TechnicianProductivitySummaryCardsProps {
  summary: TechnicianProductivitySummary;
  period: TechnicianProductivityPeriod;
}

export default function TechnicianProductivitySummaryCards({
  summary,
  period,
}: TechnicianProductivitySummaryCardsProps) {
  const isPositive = summary.productivity_hours >= 0;
  const color = isPositive ? "green" : "red";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Horas facturadas"
        value={formatHours(summary.billed_hours)}
        subtitle={`de ${formatHours(summary.standard_hours)} estándar`}
        icon={Clock}
        variant="outline"
        color={color}
        showProgress
        progressValue={summary.productivity_percentage}
        progressMax={100}
      />

      <MetricCard
        title="Productividad"
        value={`${isPositive ? "+" : ""}${formatHours(summary.productivity_hours)} · ${summary.productivity_percentage}%`}
        subtitle={`${period.working_days} / ${period.total_days} días laborados`}
        icon={TrendingUp}
        variant="outline"
        color={color}
      />

      <MetricCard
        title="Ganancia por productividad"
        value={formatMoney(summary.commission)}
        subtitle={`${formatMoney(summary.earnings_per_hour)} / hora`}
        icon={Wallet}
        variant="outline"
        color={color}
      />

      <MetricCard
        title="Órdenes de trabajo"
        value={summary.total_work_orders}
        subtitle={period.description}
        icon={Wrench}
        variant="outline"
        color="gray"
      />
    </div>
  );
}
