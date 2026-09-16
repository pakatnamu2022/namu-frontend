"use client";

import { Target, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { MetricCard } from "@/shared/components/MetricCard";
import {
  ExecutiveSummary,
  ExecutiveVehicularCrossingSummary,
  PeriodInfo,
} from "../lib/objectivesDashboard.interface";
import { OBJECTIVE_STATUS_COLOR } from "../lib/objectivesDashboard.constants";

interface ObjectivesExecutiveSummaryProps {
  summary: ExecutiveSummary;
  sumaryVehicular: ExecutiveVehicularCrossingSummary;
  period: PeriodInfo;
}

const TREND_ICON = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
};

const formatCurrency = (value: number) =>
  `S/ ${new Intl.NumberFormat("es-PE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)}`;

export default function ObjectivesExecutiveSummary({
  summary,
  sumaryVehicular,
  period,
}: ObjectivesExecutiveSummaryProps) {
  const TrendIcon = TREND_ICON[summary.trend];
  const color = OBJECTIVE_STATUS_COLOR[summary.status];
  const colorVehicular = OBJECTIVE_STATUS_COLOR[sumaryVehicular.status];

  const { difference } = summary.expected_vs_real;
  const { difference: differenceVehicular } = sumaryVehicular.expected_vs_real;

  const formatDifference = (value: number) =>
    `${value >= 0 ? "+" : ""}${value.toFixed(1)}% vs. esperado`;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Objetivo (Taller - Mostrador)"
          value={formatCurrency(summary.total_objective)}
          subtitle={period.name}
          icon={Target}
          variant="outline"
          color="blue"
        />

        <MetricCard
          title="Avance (Taller - Mostrador)"
          value={formatCurrency(summary.total_progress)}
          subtitle={`${summary.completion_percentage.toFixed(1)}% del objetivo`}
          footer={formatDifference(difference)}
          icon={TrendIcon}
          variant="outline"
          color={color}
          showProgress
          progressValue={summary.completion_percentage}
          progressMax={100}
        />

        <MetricCard
          title="Objetivo Paso Vehicular"
          value={sumaryVehicular.total_objective}
          subtitle={period.name}
          icon={Target}
          variant="outline"
          color="blue"
        />

        <MetricCard
          title="Avance Paso Vehicular"
          value={sumaryVehicular.total_progress}
          subtitle={`${sumaryVehicular.completion_percentage.toFixed(1)}% del objetivo`}
          footer={formatDifference(differenceVehicular)}
          icon={TrendIcon}
          variant="outline"
          color={colorVehicular}
          showProgress
          progressValue={sumaryVehicular.completion_percentage}
          progressMax={100}
        />
      </div>
    </div>
  );
}
