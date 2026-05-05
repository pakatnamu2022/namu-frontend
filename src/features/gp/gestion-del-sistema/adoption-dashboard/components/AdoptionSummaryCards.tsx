import { MetricCard } from "@/shared/components/MetricCard";
import {
  Users,
  Activity,
  Building2,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import type { AdoptionSummary } from "../lib/adoption.interface";

interface Props {
  data: AdoptionSummary;
}

export default function AdoptionSummaryCards({ data }: Props) {
  const trend30Pct = data.trend_vs_previous_period;
  const trend7Ops = data.trend_7_days.ops;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <MetricCard
        title="Usuarios Activos"
        value={data.active_users}
        subtitle="Con operaciones registradas"
        icon={Users}
        color="blue"
        colorIntensity="600"
        variant="outline"
      />

      <MetricCard
        title="Total Operaciones"
        value={data.total_ops.toLocaleString()}
        subtitle="Operaciones de persistencia"
        icon={Activity}
        color="emerald"
        colorIntensity="600"
        variant="outline"
      />

      <MetricCard
        title="Sede Líder"
        value={data.top_sede ?? "—"}
        subtitle="Sede con mayor adopción"
        icon={Building2}
        color="violet"
        colorIntensity="600"
        variant="outline"
      />

      <MetricCard
        title="Índice Global"
        value={`${data.global_adoption_index.toFixed(1)}%`}
        subtitle="Score de adopción promedio"
        icon={BarChart3}
        color={
          data.global_adoption_index >= 70
            ? "green"
            : data.global_adoption_index >= 40
            ? "amber"
            : "red"
        }
        colorIntensity="600"
        variant="outline"
        showProgress
        progressValue={data.global_adoption_index}
        progressMax={100}
      />

      <MetricCard
        title="Ops últimos 7 días"
        value={trend7Ops.toLocaleString()}
        subtitle={
          trend30Pct !== null
            ? `${trend30Pct > 0 ? "+" : ""}${trend30Pct.toFixed(1)}% vs período anterior`
            : `${data.trend_30_days.ops.toLocaleString()} ops (30 días)`
        }
        icon={TrendingUp}
        color={trend30Pct !== null ? (trend30Pct >= 0 ? "green" : "red") : "blue"}
        colorIntensity="600"
        variant="outline"
      />
    </div>
  );
}
