import { ProgressStats } from "../../evaluaciones/lib/evaluation.interface";

export type KPICardType =
  | "total"
  | "completed"
  | "in_progress"
  | "not_started";

export const getKPITitle = (
  type: KPICardType,
  progressStats: ProgressStats
): string => {
  const kpiData = {
    total: {
      label: "Total Participantes",
      value: progressStats.total_participants,
    },
    completed: {
      label: "Completadas",
      value: progressStats.completed_participants,
    },
    in_progress: {
      label: "En Progreso",
      value: progressStats.in_progress_participants,
    },
    not_started: {
      label: "Sin Iniciar",
      value: progressStats.not_started_participants,
    },
  };
  const kpi = kpiData[type];
  return `${kpi.label} (${kpi.value})`;
};
