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
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
        {(startDate || endDate) && (
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {startDate
                ? new Date(startDate).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "short",
                  })
                : "N/A"}{" "}
              -{" "}
              {endDate
                ? new Date(endDate).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "short",
                  })
                : "N/A"}
            </span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>
            {completedTasks}/{totalTasks}
          </span>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="font-medium">Progreso</span>
          <span className="text-muted-foreground">{progress.toFixed(0)}%</span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>
    </div>
  );
}
