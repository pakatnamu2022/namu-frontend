import { BadgeColor } from "@/components/ui/badge";
import type { MarkType } from "./attendance.interface";

export const ATTENDANCE = {
  ENDPOINT: "/gp/gh/attendance",
  QUERY_KEY: "gp-attendance",
  ROUTE: "asistencias",
  ABSOLUTE_ROUTE: "/gp/gestion-humana/asistencias/asistencias",
  BULK_STORE_ABSOLUTE_ROUTE: "/gp/gestion-humana/asistencias/marcacion-masiva",
  SUNAFIL_ABSOLUTE_ROUTE: "/gp/gestion-humana/asistencias/sunafil",
  INTERNAL_ABSOLUTE_ROUTE: "/gp/gestion-humana/asistencias/interno",
  PERSON_ABSOLUTE_ROUTE: "/gp/gestion-humana/asistencias/asistencias",
} as const;

export const ATTENDANCE_EXPORT = {
  ENDPOINT_EXPORT_EXCEL: `${ATTENDANCE.ENDPOINT}/export?format=excel`,
  ENDPOINT_EXPORT_PDF: `${ATTENDANCE.ENDPOINT}/export?format=pdf`,
};

export const MARK_TYPE_LABELS: Record<MarkType, string> = {
  check_in: "Entrada",
  lunch_out: "Salida almuerzo",
  lunch_in: "Regreso almuerzo",
  check_out: "Salida",
};

export const MARK_TYPE_COLORS: Record<MarkType, BadgeColor> = {
  check_in: "green",
  lunch_out: "amber",
  lunch_in: "indigo",
  check_out: "red",
};

export const MARK_TYPE_OPTIONS = [
  { value: "check_in", label: "Entrada" },
  { value: "lunch_out", label: "Salida almuerzo" },
  { value: "lunch_in", label: "Regreso almuerzo" },
  { value: "check_out", label: "Salida" },
] as const;
