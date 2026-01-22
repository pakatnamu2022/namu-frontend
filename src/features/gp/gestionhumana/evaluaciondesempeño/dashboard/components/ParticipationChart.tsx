"use client";

import * as React from "react";
import { ChartConfig } from "@/components/ui/chart";
import { InteractivePieChart } from "@/features/ap/comercial/dashboard-visitas-leads/components/InteractivePieChart";
import { TrendingUp } from "lucide-react";

interface ProgressStats {
  completed_participants: number;
  in_progress_participants: number;
  not_started_participants: number;
  total_participants: number;
}

interface ParticipationChartProps {
  progressStats: ProgressStats;
}

const chartConfig = {
  value: {
    label: "Participantes",
  },
  completed: {
    label: "Completado",
    color: "var(--chart-2)",
  },
  in_progress: {
    label: "En Progreso",
    color: "var(--chart-4)",
  },
  not_started: {
    label: "Sin Iniciar",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export const ParticipationChart: React.FC<ParticipationChartProps> = ({
  progressStats,
}) => {
  const participationData = React.useMemo(
    () => [
      {
        name: "completed",
        value: progressStats.completed_participants,
        fill: "var(--color-completed)",
      },
      {
        name: "in_progress",
        value: progressStats.in_progress_participants,
        fill: "var(--color-in_progress)",
      },
      {
        name: "not_started",
        value: progressStats.not_started_participants,
        fill: "var(--color-not_started)",
      },
    ],
    [progressStats],
  );

  return (
    <InteractivePieChart
      id="participation-chart"
      title="Distribución de Participantes"
      subtitle="Estado actual de las evaluaciones"
      data={participationData}
      config={chartConfig}
      valueLabel="Participantes"
      showLegend
      footerInfo={{
        label: "Total de Participantes",
        value: progressStats.total_participants,
        icon: <TrendingUp className="text-success-foreground" />,
        trend: `${(
          (progressStats.completed_participants /
            progressStats.total_participants) *
          100
        ).toFixed(2)}% Completado`,
      }}
    />
  );
};
