import { ModelComplete } from "@/core/core.interface";

const ROUTE = "parametros";

export const PARAMETER: ModelComplete = {
  MODEL: {
    name: "Parámetro",
    plural: "Parámetros",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/gp/gh/performanceEvaluation/parameter",
  QUERY_KEY: "parameters",
  ROUTE,
  ROUTE_ADD: `${ROUTE}/agregar`,
  ROUTE_UPDATE: `${ROUTE}/actualizar`,
};

export const PARAMETER_SCALES = [
  "bg-red-100 text-red-400",
  "bg-orange-100 text-orange-400",
  "bg-amber-100 text-amber-500",
  "bg-yellow-100 text-yellow-500",
  "bg-green-100 text-green-500",
  "bg-emerald-100 text-emerald-500",
];

export type ParameterScale = (typeof PARAMETER_SCALES)[number];

export const SCALE_TO_COLOR_MAP: Record<ParameterScale, string> = {
  "bg-red-100 text-red-400": "#f87171", // red-400
  "bg-orange-100 text-orange-400": "#fb923c", // orange-400
  "bg-amber-100 text-amber-500": "#f59e0b", // amber-500
  "bg-yellow-100 text-yellow-500": "#eab308", // yellow-500
  "bg-green-100 text-green-500": "#22c55e", // green-500
  "bg-emerald-100 text-emerald-500": "#10b981", // emerald-500
};

export const PARAMETER_TYPES = [
  { value: "objectives", label: "Objetivos" },
  { value: "competences", label: "Competencias" },
  { value: "final", label: "Final" },
];
