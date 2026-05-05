"use client";

import { useEffect, useState } from "react";
import { Timer } from "lucide-react";
import { WorkOrderPlanningResource } from "../lib/workOrderPlanning.interface";

interface ElapsedTimerProps {
  planning: WorkOrderPlanningResource;
}

function formatElapsed(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [
    String(h).padStart(2, "0"),
    String(m).padStart(2, "0"),
    String(s).padStart(2, "0"),
  ].join(":");
}

export function ElapsedTimer({ planning }: ElapsedTimerProps) {
  const { status, has_active_session, actual_start_datetime, actual_hours } =
    planning;

  const [elapsed, setElapsed] = useState<number>(0);

  const isRunning = status === "in_progress" && has_active_session;

  useEffect(() => {
    if (!isRunning || !actual_start_datetime) return;

    const start = new Date(actual_start_datetime).getTime();

    const tick = () => {
      const now = Date.now();
      setElapsed(Math.floor((now - start) / 1000));
    };

    tick(); // ejecutar inmediatamente
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isRunning, actual_start_datetime]);

  // Planificado sin inicio real
  if (status === "planned" || !actual_start_datetime) {
    return <span className="text-muted-foreground">-</span>;
  }

  // Completado o pausado: mostrar las horas reales estáticas
  if (status === "completed" || (status === "in_progress" && !has_active_session)) {
    const staticSeconds = actual_hours != null ? Math.round(actual_hours * 3600) : null;
    return (
      <div className="flex items-center gap-1 text-muted-foreground">
        <Timer className="h-4 w-4" />
        <span className="font-mono text-sm">
          {staticSeconds != null ? formatElapsed(staticSeconds) : "-"}
        </span>
      </div>
    );
  }

  // En progreso con sesión activa: cronómetro corriendo
  const isOvertime =
    planning.estimated_hours != null &&
    elapsed > planning.estimated_hours * 3600;

  return (
    <div
      className={`flex items-center gap-1 ${
        isOvertime ? "text-red-600" : "text-green-600"
      }`}
    >
      <Timer className={`h-4 w-4 animate-pulse`} />
      <span className="font-mono text-sm font-semibold">
        {formatElapsed(elapsed)}
      </span>
    </div>
  );
}
