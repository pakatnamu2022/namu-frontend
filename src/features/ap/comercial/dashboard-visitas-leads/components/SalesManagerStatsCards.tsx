"use client";

import { ChartConfig } from "@/components/ui/chart";
import { TrendingUp, Users } from "lucide-react";
import { SalesManagerStatsResponse } from "../lib/dashboard.interface";
import { InteractivePieChart } from "./InteractivePieChart";

interface SalesManagerStatsCardsProps {
  teamTotals: SalesManagerStatsResponse["data"]["team_totals"];
}

export default function SalesManagerStatsCards({
  teamTotals,
}: SalesManagerStatsCardsProps) {
  // Datos para el gráfico de atención
  const attentionData = [
    {
      name: "Atendidos",
      value: teamTotals.attended,
      fill: "var(--chart-2)",
    },
    {
      name: "Pendientes",
      value: teamTotals.not_attended,
      fill: "var(--chart-3)",
    },
    {
      name: "Descartados",
      value: teamTotals.discarded,
      fill: "var(--chart-1)",
    },
  ];

  const attentionConfig = {
    value: {
      label: "Cantidad",
    },
    Atendidos: {
      label: "Atendidos",
      color: "var(--chart-2)",
    },
    Pendientes: {
      label: "Pendientes",
      color: "var(--chart-3)",
    },
    Descartados: {
      label: "Descartados",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  // Datos para el gráfico de estados de oportunidad
  const opportunityData = Object.entries(teamTotals.by_opportunity_status).map(
    ([name, value]) => ({
      name,
      value,
      fill: `var(--color-${name})`,
    }),
  );

  const opportunityConfig = Object.entries(
    teamTotals.by_opportunity_status,
  ).reduce(
    (acc, [status], index) => {
      acc[status] = {
        label: status,
        color: `var(--chart-${(index % 5) + 1})`,
      };
      return acc;
    },
    { value: { label: "Cantidad" } } as ChartConfig,
  );

  if (opportunityData.length === 0) return null;

  return (
    <div className="space-y-6 grid grid-cols-4 gap-4">
      {/* Gráfico de Estado de Atención */}
      <InteractivePieChart
        id="attention-chart"
        title="Estado de Atención"
        data={attentionData}
        config={attentionConfig}
        valueLabel="Visitas"
        footerInfo={{
          label: "Total visitas",
          value: teamTotals.total_visits.toLocaleString(),
          trend: `${teamTotals.attention_percentage.toFixed(1)}% atendidos`,
          icon: <TrendingUp className="h-4 w-4 text-emerald-500" />,
        }}
      />

      {/* Gráfico de Estados de Oportunidad */}
      <InteractivePieChart
        id="opportunity-chart"
        title="Estados de Oportunidad"
        data={opportunityData}
        config={opportunityConfig}
        valueLabel="Oportunidades"
        footerInfo={{
          label: "Total oportunidades",
          value: Object.values(teamTotals.by_opportunity_status)
            .reduce((sum, val) => sum + val, 0)
            .toLocaleString(),
          trend: `${teamTotals.total_advisors} asesores`,
          icon: <Users className="h-4 w-4 text-blue-500" />,
        }}
      />
    </div>
  );
}
