import { type ModelComplete } from "@/core/core.interface";

const ROUTE = "periodos";
const ABSOLUTE_ROUTE = `/gp/gestion-humana/planillas/${ROUTE}`;

export const PAYROLL_PERIOD: ModelComplete = {
  MODEL: {
    name: "Periodo de Planilla",
    plural: "Periodos de Planilla",
    gender: false,
  },
  ICON: "Calendar",
  ENDPOINT: "/gp/gh/payroll/periods",
  QUERY_KEY: "payroll-periods",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};

export const PAYROLL_PERIOD_STATUS = {
  OPEN: "OPEN",
  PROCESSING: "PROCESSING",
  CALCULATED: "CALCULATED",
  APPROVED: "APPROVED",
  CLOSED: "CLOSED",
};

export const PAYROLL_PERIOD_STATUS_CONFIG: Record<
  string,
  { label: string; color: "gray" | "orange" | "green" | "blue" }
> = {
  [PAYROLL_PERIOD_STATUS.OPEN]: { label: "Abierto", color: "blue" },
  [PAYROLL_PERIOD_STATUS.PROCESSING]: {
    label: "Procesando",
    color: "orange",
  },
  [PAYROLL_PERIOD_STATUS.CALCULATED]: {
    label: "Calculado",
    color: "green",
  },
  [PAYROLL_PERIOD_STATUS.APPROVED]: { label: "Aprobado", color: "green" },
  [PAYROLL_PERIOD_STATUS.CLOSED]: { label: "Cerrado", color: "gray" },
};
