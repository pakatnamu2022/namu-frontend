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

// Suma los segundos de todas las sesiones cerradas (pausadas o completadas)
function getCompletedSessionsSeconds(
  planning: WorkOrderPlanningResource,
): number {
  if (!planning.sessions) return 0;
  return planning.sessions.reduce((acc, session) => {
    if (session.end_datetime && session.hours_worked != null) {
      return acc + Math.round(session.hours_worked * 3600);
    }
    return acc;
  }, 0);
}

// Retorna la sesión activa (sin end_datetime) si existe
function getActiveSession(planning: WorkOrderPlanningResource) {
  if (!planning.sessions) return null;
  return planning.sessions.find((s) => s.end_datetime === null) ?? null;
}

export function ElapsedTimer({ planning }: ElapsedTimerProps) {
  const { status, has_active_session, actual_hours } = planning;

  const [liveSeconds, setLiveSeconds] = useState<number>(0);

  const activeSession = getActiveSession(planning);
  const isRunning =
    status === "in_progress" && has_active_session && activeSession !== null;

  useEffect(() => {
    if (!isRunning || !activeSession) return;

    // El backend envía en hora local sin timezone (ej: "2026-05-16 11:33:19")
    // Solo normalizar el espacio a T para ISO válido, sin agregar Z
    const rawStart = activeSession.start_datetime;
    const isoStart = rawStart.replace(" ", "T");
    const sessionStart = new Date(isoStart).getTime();

    const tick = () => {
      const now = Date.now();
      const diff = Math.floor((now - sessionStart) / 1000);
      setLiveSeconds(Math.max(0, diff));
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isRunning, activeSession?.start_datetime]);

  // Sin inicio real todavía
  if (status === "planned" || !planning.actual_start_datetime) {
    return <span className="text-muted-foreground">-</span>;
  }

  // Completado: mostrar horas reales del backend
  if (status === "completed") {
    const staticSeconds =
      actual_hours != null ? Math.round(actual_hours * 3600) : null;
    return (
      <div className="flex items-center gap-1 text-muted-foreground">
        <Timer className="h-4 w-4" />
        <span className="font-mono text-sm">
          {staticSeconds != null ? formatElapsed(staticSeconds) : "-"}
        </span>
      </div>
    );
  }

  // Pausado: sumar sesiones cerradas (sin sesión activa corriendo)
  if (status === "in_progress" && !has_active_session) {
    const pausedSeconds = getCompletedSessionsSeconds(planning);
    const fallback =
      actual_hours != null ? Math.round(actual_hours * 3600) : null;
    const displaySeconds = pausedSeconds > 0 ? pausedSeconds : fallback;
    return (
      <div className="flex items-center gap-1 text-muted-foreground">
        <Timer className="h-4 w-4" />
        <span className="font-mono text-sm">
          {displaySeconds != null ? formatElapsed(displaySeconds) : "-"}
        </span>
      </div>
    );
  }

  // En progreso con sesión activa: sesiones anteriores + tiempo corriendo ahora
  const accumulatedSeconds = getCompletedSessionsSeconds(planning);
  const totalSeconds = accumulatedSeconds + liveSeconds;

  const isOvertime =
    planning.estimated_hours != null &&
    totalSeconds > planning.estimated_hours * 3600;

  return (
    <div
      className={`flex items-center gap-1 ${
        isOvertime ? "text-red-600" : "text-green-600"
      }`}
    >
      <Timer className="h-4 w-4 animate-pulse" />
      <span className="font-mono text-sm font-semibold">
        {formatElapsed(totalSeconds)}
      </span>
    </div>
  );
}
