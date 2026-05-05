"use client";

import { WorkOrderPlanningResource } from "../lib/workOrderPlanning.interface";
import { Clock, CheckCircle, PlayCircle, Calendar } from "lucide-react";
import { MetricCard } from "@/shared/components/MetricCard";

interface DashboardStatsProps {
  data: WorkOrderPlanningResource[];
}

export function DashboardStats({ data }: DashboardStatsProps) {
  const stats = {
    total: data.length,
    planned: data.filter((p) => p.status === "planned").length,
    inProgress: data.filter((p) => p.status === "in_progress").length,
    completed: data.filter((p) => p.status === "completed").length,
    totalEstimated: data.reduce(
      (acc, p) => acc + (Number(p.estimated_hours) || 0),
      0
    ),
    totalActual: data.reduce(
      (acc, p) => acc + (Number(p.actual_hours) || 0),
      0
    ),
  };

  const efficiency =
    stats.totalEstimated > 0 && stats.totalActual > 0
      ? ((stats.totalActual / stats.totalEstimated) * 100).toFixed(1)
      : "0";

  const completionRate =
    stats.total > 0
      ? ((stats.completed / stats.total) * 100).toFixed(1)
      : "0";

  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-4">
      <MetricCard
        title="Total Planificaciones"
        value={stats.total}
        subtitle={`${stats.planned} planificadas, ${stats.inProgress} en progreso`}
        icon={Calendar}
        variant="outline"
        color="blue"
        colorIntensity="600"
        showProgress
        progressValue={stats.total}
        progressMax={stats.total || 1}
      />

      <MetricCard
        title="En Progreso"
        value={stats.inProgress}
        subtitle={`${data.filter((p) => p.has_active_session).length} sesiones activas`}
        icon={PlayCircle}
        variant="outline"
        color="yellow"
        colorIntensity="600"
        showProgress
        progressValue={stats.inProgress}
        progressMax={stats.total || 1}
      />

      <MetricCard
        title="Completadas"
        value={stats.completed}
        subtitle={`${completionRate}% del total`}
        icon={CheckCircle}
        variant="outline"
        color="green"
        colorIntensity="600"
        showProgress
        progressValue={stats.completed}
        progressMax={stats.total || 1}
      />

      <MetricCard
        title="Eficiencia"
        value={`${efficiency}%`}
        subtitle={`${stats.totalActual.toFixed(1)}h de ${stats.totalEstimated > 0 ? stats.totalEstimated.toFixed(1) : 0}h estimadas`}
        icon={Clock}
        variant="outline"
        color="indigo"
        colorIntensity="600"
        showProgress
        progressValue={stats.totalActual}
        progressMax={stats.totalEstimated || 1}
      />
    </div>
  );
}
