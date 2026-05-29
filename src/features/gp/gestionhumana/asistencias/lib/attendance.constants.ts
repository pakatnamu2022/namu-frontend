import type { MarkType } from "./attendance.interface";

export const ATTENDANCE = {
  ENDPOINT: "/admin/attendance",
  QUERY_KEY: "gp-attendance",
  ROUTE: "asistencias",
  ABSOLUTE_ROUTE: "/gp/gestion-humana/asistencias/asistencias",
  SUNAFIL_ABSOLUTE_ROUTE: "/gp/gestion-humana/asistencias/sunafil",
  INTERNAL_ABSOLUTE_ROUTE: "/gp/gestion-humana/asistencias/interno",
  PERSON_ABSOLUTE_ROUTE: "/gp/gestion-humana/asistencias/asistencias",
} as const;

export const MARK_TYPE_LABELS: Record<MarkType, string> = {
  check_in: "Entrada",
  lunch_out: "Salida almuerzo",
  lunch_in: "Regreso almuerzo",
  check_out: "Salida",
};

export const MARK_TYPE_COLORS: Record<MarkType, string> = {
  check_in: "bg-green-100 text-green-700 border-green-200",
  lunch_out: "bg-orange-100 text-orange-700 border-orange-200",
  lunch_in: "bg-blue-100 text-blue-700 border-blue-200",
  check_out: "bg-red-100 text-red-700 border-red-200",
};

export const MARK_TYPE_OPTIONS = [
  { value: "check_in", label: "Entrada" },
  { value: "lunch_out", label: "Salida almuerzo" },
  { value: "lunch_in", label: "Regreso almuerzo" },
  { value: "check_out", label: "Salida" },
] as const;
