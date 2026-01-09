"use client";

import { DashboardCard } from "@/components/ui/dashboard-card";
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

interface DashboardOverviewCardsProps {
  data: IndicatorsByDateTotalRange;
  type: "VISITA" | "LEADS";
}

export default function DashboardOverviewCards({
  data,
  type,
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
    TEMPLADO: { color: "orange", intensity: "500" },
    CALIENTE: { color: "red", intensity: "600" },
    "VENTA CONCRETADA": { color: "green", intensity: "600" },
    CERRADA: { color: "gray", intensity: "600" },
  };

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title={type === "LEADS" ? "Total Leads" : "Total Visitas"}
          value={data.total_visitas}
          description={
            type === "LEADS"
              ? "Todos los leads registrados"
              : "Todas las visitas registradas"
          }
          icon={Users}
          variant="outline"
        />

        <DashboardCard
          title="Atendidos"
          value={data.atendidos}
          description={`${
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

        <DashboardCard
          title="No Atendidos"
          value={data.no_atendidos}
          description={`${
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

        <DashboardCard
          title="Descartados"
          value={data.descartados}
          description={`${
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
      </div>

      {/* Opportunity States */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Estados de Oportunidad</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {Object.entries(data.por_estado_oportunidad).map(([state, count]) => {
            const Icon = opportunityStateIcons[state] || Users;
            const colorConfig =
              opportunityStateColors[state] || { color: "gray" as const, intensity: "600" as const };

            return (
              <DashboardCard
                key={state}
                title={state}
                value={count}
                description={`${
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
    </div>
  );
}
