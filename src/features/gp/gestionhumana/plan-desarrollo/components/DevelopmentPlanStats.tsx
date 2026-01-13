"use client";

import { Calendar, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface DevelopmentPlanStatsProps {
  startDate: string | null;
  endDate: string | null;
  completedTasks: number;
  totalTasks: number;
  progress: number;
}

export function DevelopmentPlanStats({
  startDate,
  endDate,
  completedTasks,
  totalTasks,
  progress,
}: DevelopmentPlanStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg bg-muted/30">
      {/* Fechas */}
      {(startDate || endDate) && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4 shrink-0" />
          <div className="flex flex-col">
            <span className="text-xs font-medium text-foreground">Período</span>
            <span className="text-xs">
              {startDate
                ? new Date(startDate).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "short",
                  })
                : "N/A"}{" "}
              -{" "}
              {endDate
                ? new Date(endDate).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "short",
                  })
                : "N/A"}
            </span>
          </div>
        </div>
      )}

      {/* Tareas completadas */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CheckCircle2 className="w-4 h-4 shrink-0" />
        <div className="flex flex-col">
          <span className="text-xs font-medium text-foreground">Tareas</span>
          <span className="text-xs">
            {completedTasks} de {totalTasks} completadas
          </span>
        </div>
      </div>

      {/* Progress bar - ocupa todo el ancho en ambas columnas */}
      <div className="col-span-1 sm:col-span-2 space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="font-medium">Progreso</span>
          <span className="text-muted-foreground font-medium">{progress.toFixed(0)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </div>
  );
}
