"use client";

import { Users, Clock, TrendingUp, Wallet } from "lucide-react";
import { MetricCard } from "@/shared/components/MetricCard";
import { formatHours, formatMoney } from "@/core/core.function";
import {
  ProductivityExecutiveSummary as ProductivityExecutiveSummaryType,
  ProductivityPeriodInfo,
} from "../lib/productivityDashboard.interface";
import { PRODUCTIVITY_STATUS_COLOR } from "../lib/productivityDashboard.constants";

interface ProductivityExecutiveSummaryProps {
  summary: ProductivityExecutiveSummaryType;
  period: ProductivityPeriodInfo;
}

export default function ProductivityExecutiveSummary({
  summary,
  period,
}: ProductivityExecutiveSummaryProps) {
  const color = PRODUCTIVITY_STATUS_COLOR[summary.status];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Técnicos"
        value={summary.total_technicians}
        subtitle={`${summary.total_headquarters} sedes · ${period.working_days} días hábiles`}
        icon={Users}
        variant="outline"
        color="gray"
      />

      <MetricCard
        title="Horas facturadas"
        value={formatHours(summary.total_billed_hours)}
        subtitle={`de ${formatHours(summary.total_standard_hours)} laborables`}
        icon={Clock}
        variant="outline"
        color={color}
        showProgress
        progressValue={summary.average_productivity_percentage}
        progressMax={100}
      />

      <MetricCard
        title="Productividad"
        value={`${summary.total_productivity_hours >= 0 ? "+" : "-"}${formatHours(Math.abs(summary.total_productivity_hours))}`}
        subtitle={`${summary.average_productivity_percentage.toFixed(1)}% del laborables`}
        icon={TrendingUp}
        variant="outline"
        color={color}
      />

      <MetricCard
        title="Ganancia por productividad"
        value={formatMoney(summary.total_earnings)}
        subtitle={period.description}
        icon={Wallet}
        variant="outline"
        color={color}
      />
    </div>
  );
}
