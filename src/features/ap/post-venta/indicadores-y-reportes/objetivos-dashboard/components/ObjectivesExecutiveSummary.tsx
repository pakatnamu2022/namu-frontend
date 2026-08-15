"use client";

import {
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  CalendarClock,
} from "lucide-react";
import { MetricCard } from "@/shared/components/MetricCard";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ExecutiveSummary,
  PeriodInfo,
} from "../lib/objectivesDashboard.interface";
import { OBJECTIVE_STATUS_COLOR } from "../lib/objectivesDashboard.constants";

interface ObjectivesExecutiveSummaryProps {
  summary: ExecutiveSummary;
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
  period,
}: ObjectivesExecutiveSummaryProps) {
  const TrendIcon = TREND_ICON[summary.trend];
  const color = OBJECTIVE_STATUS_COLOR[summary.status];
  const { difference } = summary.expected_vs_real;
  const isAhead = difference >= 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Objetivo del período"
          value={formatCurrency(summary.total_objective)}
          subtitle={period.name}
          icon={Target}
          variant="outline"
          color="blue"
        />

        <MetricCard
          title="Avance real"
          value={formatCurrency(summary.total_progress)}
          subtitle={`${summary.completion_percentage.toFixed(1)}% del objetivo`}
          icon={TrendIcon}
          variant="outline"
          color={color}
          showProgress
          progressValue={summary.completion_percentage}
          progressMax={100}
        />

        <MetricCard
          title="Días restantes"
          value={summary.days_remaining}
          subtitle={`de ${period.days_in_month} días del mes`}
          icon={CalendarClock}
          variant="outline"
          color="gray"
        />
      </div>

      <Card>
        <CardHeader className="pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-base">
              Avance esperado vs. real
            </CardTitle>
            <CardDescription>
              Según los días transcurridos del período ({period.days_elapsed} de{" "}
              {period.days_in_month} días)
            </CardDescription>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            <div className="space-y-0.5 min-w-0">
              <p className="text-xs text-muted-foreground truncate">Esperado</p>
              <p className="text-lg font-semibold tabular-nums truncate">
                {summary.expected_vs_real.expected_percentage.toFixed(1)}%
              </p>
            </div>
            <div className="space-y-0.5 min-w-0">
              <p className="text-xs text-muted-foreground truncate">Real</p>
              <p className="text-lg font-semibold tabular-nums truncate">
                {summary.expected_vs_real.real_percentage.toFixed(1)}%
              </p>
            </div>
            <div className="space-y-0.5 min-w-0">
              <p className="text-xs text-muted-foreground truncate">
                Diferencia
              </p>
              <Badge
                color={isAhead ? "green" : "red"}
                className="text-xs sm:text-sm font-semibold"
              >
                {isAhead ? "+" : ""}
                {difference.toFixed(1)}%
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
