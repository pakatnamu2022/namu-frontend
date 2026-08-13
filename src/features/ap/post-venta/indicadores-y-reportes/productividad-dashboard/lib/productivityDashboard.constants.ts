import { ProductivityStatus } from "./productivityDashboard.interface";
import type { BadgeColor } from "@/components/ui/badge";

export const PRODUCTIVITY_STATUS_LABEL: Record<ProductivityStatus, string> = {
  critical: "Crítico",
  warning: "En riesgo",
  on_track: "En meta",
  exceeded: "Superado",
};

export const PRODUCTIVITY_STATUS_BADGE_COLOR: Record<
  ProductivityStatus,
  BadgeColor
> = {
  critical: "red",
  warning: "yellow",
  on_track: "green",
  exceeded: "blue",
};

// Tailwind color usado en MetricCard (progreso, íconos, texto)
export const PRODUCTIVITY_STATUS_COLOR: Record<
  ProductivityStatus,
  "red" | "yellow" | "green" | "blue"
> = {
  critical: "red",
  warning: "yellow",
  on_track: "green",
  exceeded: "blue",
};

// Color hexadecimal usado en gráficos (recharts no soporta clases de Tailwind)
export const PRODUCTIVITY_STATUS_HEX: Record<ProductivityStatus, string> = {
  critical: "#dc2626",
  warning: "#d97706",
  on_track: "#16a34a",
  exceeded: "#2563eb",
};
