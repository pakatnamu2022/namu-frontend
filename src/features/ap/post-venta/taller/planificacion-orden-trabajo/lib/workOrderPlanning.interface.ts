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
