"use client";

import { Target, TrendingUp, TrendingDown, Minus, CalendarClock } from "lucide-react";
import { MetricCard } from "@/shared/components/MetricCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ExecutiveSummary,
  PeriodInfo,
} from "../lib/objectivesDashboard.interface";
import {
  OBJECTIVE_STATUS_COLOR,
  OBJECTIVE_STATUS_LABEL,
  OBJECTIVE_TREND_LABEL,
} from "../lib/objectivesDashboard.constants";
import { cn } from "@/lib/utils";

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
          variant="default"
          color={color}
          showProgress
          progressValue={summary.completion_percentage}
          progressMax={100}
        />

        <MetricCard
          title="Estado general"
          value={OBJECTIVE_STATUS_LABEL[summary.status]}
          subtitle={OBJECTIVE_TREND_LABEL[summary.trend]}
          icon={TrendIcon}
          variant="outline"
          color={color}
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
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Avance esperado vs. real</CardTitle>
          <CardDescription>
            Según los días transcurridos del período ({period.days_elapsed} de{" "}
            {period.days_in_month} días)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-6">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Esperado</p>
              <p className="text-2xl font-semibold tabular-nums">
                {summary.expected_vs_real.expected_percentage.toFixed(1)}%
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Real</p>
              <p className="text-2xl font-semibold tabular-nums">
                {summary.expected_vs_real.real_percentage.toFixed(1)}%
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Diferencia</p>
              <Badge
                color={isAhead ? "green" : "red"}
                className="text-sm font-semibold"
              >
                {isAhead ? "+" : ""}
                {difference.toFixed(1)}%
              </Badge>
            </div>
            <p
              className={cn(
                "text-sm text-muted-foreground ml-auto",
                isAhead ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
              )}
            >
              {isAhead
                ? "El avance real va por delante de lo esperado para la fecha."
                : "El avance real va por detrás de lo esperado para la fecha."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
