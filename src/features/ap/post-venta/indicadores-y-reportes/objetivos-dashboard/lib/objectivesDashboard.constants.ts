import { ObjectiveStatus, ObjectiveTrend } from "./objectivesDashboard.interface";
import type { BadgeColor } from "@/components/ui/badge";

export const OBJECTIVE_STATUS_LABEL: Record<ObjectiveStatus, string> = {
  critical: "Crítico",
  warning: "En riesgo",
  on_track: "En meta",
  exceeded: "Superado",
  not_applicable: "Sin objetivo",
};

export const OBJECTIVE_STATUS_BADGE_COLOR: Record<ObjectiveStatus, BadgeColor> = {
  critical: "red",
  warning: "yellow",
  on_track: "green",
  exceeded: "blue",
  not_applicable: "gray",
};

// Tailwind color usado en MetricCard/DashboardCard (progreso, íconos, texto)
export const OBJECTIVE_STATUS_COLOR: Record<
  ObjectiveStatus,
  "red" | "yellow" | "green" | "blue" | "gray"
> = {
  critical: "red",
  warning: "yellow",
  on_track: "green",
  exceeded: "blue",
  not_applicable: "gray",
};

// Color hexadecimal usado en gráficos (recharts no soporta clases de Tailwind)
export const OBJECTIVE_STATUS_HEX: Record<ObjectiveStatus, string> = {
  critical: "#dc2626",
  warning: "#d97706",
  on_track: "#16a34a",
  exceeded: "#2563eb",
  not_applicable: "#94a3b8",
};

export const OBJECTIVE_TREND_LABEL: Record<ObjectiveTrend, string> = {
  up: "En ascenso",
  down: "En descenso",
  stable: "Estable",
};
