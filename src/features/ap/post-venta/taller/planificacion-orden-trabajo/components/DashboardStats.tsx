"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkOrderPlanningResource } from "../lib/workOrderPlanning.interface";
import { Clock, CheckCircle, PlayCircle, Calendar } from "lucide-react";

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

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Planificaciones
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.planned} planificadas, {stats.inProgress} en progreso
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
          <PlayCircle className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">
            {stats.inProgress}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {data.filter((p) => p.has_active_session).length} sesiones activas
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completadas</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {stats.completed}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {((stats.completed / stats.total) * 100).toFixed(1)}% del total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Eficiencia</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{efficiency}%</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.totalActual.toFixed(1)}h de{" "}
            {stats.totalEstimated > 0 ? stats.totalEstimated.toFixed(1) : 0}h
            estimadas
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
