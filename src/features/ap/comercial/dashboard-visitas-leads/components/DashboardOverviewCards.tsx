"use client";

import {
  Users,
  UserCheck,
  UserX,
  Trash2,
  Snowflake,
  Flame,
  TrendingUp,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { IndicatorsByDateTotalRange } from "../lib/dashboard.interface";
import { MetricCard } from "@/shared/components/MetricCard";

interface DashboardOverviewCardsProps {
  data: IndicatorsByDateTotalRange;
  type: "VISITA" | "LEADS";
}

export default function DashboardOverviewCards({
  data,
}: DashboardOverviewCardsProps) {
  const opportunityStateIcons: Record<string, any> = {
    FRIO: Snowflake,
    TEMPLADO: Flame,
    CALIENTE: TrendingUp,
    "VENTA CONCRETADA": CheckCircle2,
    CERRADA: XCircle,
  };

  type OpportunityStateColor = {
    color: "blue" | "orange" | "red" | "green" | "gray";
    intensity: "500" | "600";
  };

  const opportunityStateColors: Record<string, OpportunityStateColor> = {
    FRIO: { color: "blue", intensity: "600" },
    TEMPLADA: { color: "orange", intensity: "500" },
    CALIENTE: { color: "red", intensity: "600" },
    "VENTA CONCRETADA": { color: "green", intensity: "600" },
    CERRADA: { color: "gray", intensity: "600" },
  };

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7">
        <MetricCard
          title="Atendidos"
          value={data.atendidos}
          subtitle={`${
            data.total_visitas > 0
              ? ((data.atendidos / data.total_visitas) * 100).toFixed(1)
              : "0"
          }% del total`}
          icon={UserCheck}
          variant="outline"
          color="green"
          colorIntensity="600"
          showProgress
          progressValue={data.atendidos}
          progressMax={data.total_visitas}
        />

        <MetricCard
          title="No Atendidos"
          value={data.no_atendidos}
          subtitle={`${
            data.total_visitas > 0
              ? ((data.no_atendidos / data.total_visitas) * 100).toFixed(1)
              : "0"
          }% del total`}
          icon={UserX}
          variant="outline"
          color="yellow"
          colorIntensity="600"
          showProgress
          progressValue={data.no_atendidos}
          progressMax={data.total_visitas}
        />

        <MetricCard
          title="Descartados"
          value={data.descartados}
          subtitle={`${
            data.total_visitas > 0
              ? ((data.descartados / data.total_visitas) * 100).toFixed(1)
              : "0"
          }% del total`}
          icon={Trash2}
          variant="outline"
          color="red"
          colorIntensity="600"
          showProgress
          progressValue={data.descartados}
          progressMax={data.total_visitas}
        />

        {/* Opportunity States */}
        {Object.entries(data.por_estado_oportunidad).map(([state, count]) => {
          const Icon = opportunityStateIcons[state] || Users;
          const colorConfig = opportunityStateColors[state] || {
            color: "gray" as const,
            intensity: "600" as const,
          };

          return (
            <MetricCard
              key={state}
              title={state}
              value={count}
              subtitle={`${
                data.total_visitas > 0
                  ? ((count / data.total_visitas) * 100).toFixed(1)
                  : "0"
              }% del total`}
              icon={Icon}
              variant="outline"
              color={colorConfig.color}
              colorIntensity={colorConfig.intensity}
              showProgress
              progressValue={count}
              progressMax={data.total_visitas}
            />
          );
        })}
      </div>
    </div>
  );
}
