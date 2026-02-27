import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";

export interface WorkOrderPlanningResponse {
  data: WorkOrderPlanningResource[];
  links: Links;
  meta: Meta;
}

export interface WorkOrderPlanningResource {
  id: number;
  work_order_id: number;
  work_order_correlative?: string;
  worker_id: number;
  worker_name: string;
  description: string;
  estimated_hours: number;
  planned_start_datetime: string | null;
  planned_end_datetime: string | null;
  actual_hours: number;
  actual_start_datetime: string | null;
  actual_end_datetime: string | null;
  status: PlanningStatus;
  has_active_session: boolean;
  sessions_count: number;
  sessions?: WorkOrderPlanningSessionResource[];
  type?: string; // "internal" o "external" para casos excepcionales
  created_at: string;
  updated_at: string;
}

export interface WorkOrderPlanningSessionResource {
  id: number;
  work_order_planning_id: number;
  start_datetime: string;
  end_datetime: string | null;
  hours_worked: number | null;
  status: SessionStatus;
  pause_reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkOrderPlanningRequest {
  work_order_id: number;
  worker_id: number;
  description: string;
  estimated_hours: number;
  planned_start_datetime: string;
  group_number: number;
  type?: string; // "external" para casos excepcionales
}

export interface WorkOrderPlanningSessionRequest {
  notes?: string;
}

export interface PauseWorkRequest {
  pause_reason?: string;
}

export type PlanningStatus =
  | "planned"
  | "in_progress"
  | "completed"
  | "canceled";
export type SessionStatus = "in_progress" | "paused" | "completed";

export interface getWorkOrderPlanningProps {
  params?: Record<string, any>;
}

export const PLANNING_STATUS_LABELS: Record<PlanningStatus, string> = {
  planned: "Planificado",
  in_progress: "En Progreso",
  completed: "Completado",
  canceled: "Cancelado",
};

export const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
  in_progress: "En Progreso",
  paused: "Pausado",
  completed: "Completado",
};

export const PLANNING_STATUS_COLORS: Record<
  PlanningStatus,
  { bg: string; text: string; border: string }
> = {
  planned: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    border: "border-blue-300",
  },
  in_progress: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    border: "border-yellow-300",
  },
  completed: {
    bg: "bg-green-100",
    text: "text-green-800",
    border: "border-green-300",
  },
  canceled: {
    bg: "bg-red-100",
    text: "text-red-800",
    border: "border-red-300",
  },
};

// Visual states derived from planning data (not backend states)
// Used across WorkerTimeline and AssignedWorkColumns
export type PlanningVisualState =
  | "planned"       // status === "planned", sin sesiones pausadas
  | "paused"        // status === "in_progress" + sesión pausada (sin sesión activa)
  | "in_progress"   // status === "in_progress" + sesión activa
  | "overtime"      // status === "in_progress" + sesión activa + tiempo excedido
  | "completed";    // status === "completed"

export const PLANNING_VISUAL_STATE_COLORS: Record<
  PlanningVisualState,
  { bg: string; text: string; border: string }
> = {
  planned: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    border: "border-blue-400",
  },
  paused: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    border: "border-yellow-400",
  },
  in_progress: {
    bg: "bg-green-100",
    text: "text-green-800",
    border: "border-green-400",
  },
  overtime: {
    bg: "bg-red-100",
    text: "text-red-800",
    border: "border-red-400",
  },
  completed: {
    bg: "bg-gray-900",
    text: "text-white",
    border: "border-gray-900",
  },
};

export const PLANNING_VISUAL_STATE_LABELS: Record<PlanningVisualState, string> =
  {
    planned: "Planificado",
    paused: "Pausado",
    in_progress: "En Progreso",
    overtime: "Excediendo Tiempo",
    completed: "Completado",
  };

/**
 * Deriva el estado visual de un planning considerando sesiones y tiempo.
 * El "overtime" se calcula comparando el tiempo actual contra
 * planned_start_datetime + estimated_hours cuando hay sesión activa.
 */
export function getPlanningVisualState(
  planning: WorkOrderPlanningResource,
  now: Date = new Date()
): PlanningVisualState {
  const { status, has_active_session, sessions, planned_start_datetime, estimated_hours } =
    planning;

  if (status === "completed") return "completed";
  if (status === "planned") return "planned";

  if (status === "in_progress") {
    const hasPausedSession =
      sessions && sessions.length > 0
        ? sessions.some((s) => s.status === "paused")
        : false;

    if (!has_active_session && hasPausedSession) return "paused";

    if (has_active_session) {
      // Calcular si excedió el tiempo estimado
      if (planned_start_datetime && estimated_hours) {
        const start = new Date(planned_start_datetime);
        const expectedEnd = new Date(
          start.getTime() + estimated_hours * 60 * 60 * 1000
        );
        if (now > expectedEnd) return "overtime";
      }
      return "in_progress";
    }
  }

  return "planned";
}

/**
 * Lógica centralizada para determinar qué acciones mostrar en un planning.
 */
export function getPlanningActions(planning: WorkOrderPlanningResource): {
  showStart: boolean;
  showContinue: boolean;
  showPauseAndComplete: boolean;
} {
  const { status, has_active_session, sessions } = planning;

  const hasPausedSession =
    sessions && sessions.length > 0
      ? sessions.some((s) => s.status === "paused")
      : false;

  return {
    showStart: status === "planned" && !hasPausedSession,
    showContinue: hasPausedSession && status === "in_progress" && !has_active_session,
    showPauseAndComplete: status === "in_progress" && has_active_session,
  };
}

// Mock data for development
export interface WorkerMock {
  id: number;
  name: string;
  specialty: string;
}

export interface WorkOrderMock {
  id: number;
  correlative: string;
  vehicle_plate: string;
  customer_name: string;
}

// Consolidated Planning Interfaces
export interface ConsolidatedWorker {
  worker_id: number;
  worker_name: string;
  estimated_hours: number;
  actual_hours: number;
  status: PlanningStatus;
  planned_start_datetime: string | null;
  planned_end_datetime: string | null;
  actual_start_datetime: string | null;
  actual_end_datetime: string | null;
}

export interface ConsolidatedPlanning {
  group_number: number;
  description: string;
  total_estimated_hours: number;
  total_actual_hours: number;
  remaining_hours: number;
  progress_percentage: number;
  status: PlanningStatus;
  workers_count: number;
  workers: ConsolidatedWorker[];
}
