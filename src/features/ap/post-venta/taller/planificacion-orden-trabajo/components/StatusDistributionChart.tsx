"use client";

import {
  WorkOrderPlanningResource,
  PLANNING_STATUS_LABELS,
} from "../lib/workOrderPlanning.interface";
import { InteractivePieChart } from "@/shared/charts/InteractivePieChart";
import { ChartConfig } from "@/components/ui/chart";

interface StatusDistributionChartProps {
  data: WorkOrderPlanningResource[];
}

const STATUS_COLORS: Record<string, string> = {
  planned: "var(--chart-1)",
  in_progress: "var(--chart-5)",
  completed: "var(--chart-2)",
  canceled: "var(--chart-3)",
};

export function StatusDistributionChart({ data }: StatusDistributionChartProps) {
  const statusCounts = data.reduce(
    (acc, planning) => {
      acc[planning.status] = (acc[planning.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const pieData = Object.entries(statusCounts)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({
      name: PLANNING_STATUS_LABELS[status as keyof typeof PLANNING_STATUS_LABELS] ?? status,
      value: count,
      fill: STATUS_COLORS[status] ?? "var(--chart-4)",
    }));

  const config: ChartConfig = {
    value: { label: "Cantidad" },
    ...Object.fromEntries(
      pieData.map((item) => [
        item.name,
        { label: item.name, color: item.fill },
      ])
    ),
  };

  return (
    <InteractivePieChart
      id="planning-status-chart"
      config={config}
      data={pieData}
      title="Distribución por Estado"
      subtitle="Cantidad de planificaciones por estado"
      valueLabel="Planif."
      showLegend
      showSelectionFooter
    />
  );
}
