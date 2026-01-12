import { type ModelComplete } from "@/core/core.interface";

const ROUTE = "parametros";
const ABSOLUTE_ROUTE = `/gp/gestion-humana/evaluaciones-de-desempeno/${ROUTE}`;

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
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};

export const PARAMETER_SCALES = [
  "bg-red-100 text-red-600",
  "bg-orange-100 text-orange-600",
  "bg-amber-100 text-amber-600",
  "bg-yellow-100 text-yellow-600",
  "bg-green-100 text-green-600",
  "bg-emerald-100 text-emerald-600",
];

export type ParameterScale = (typeof PARAMETER_SCALES)[number];

export const SCALE_TO_COLOR_MAP: Record<ParameterScale, string> = {
  "bg-red-100 text-red-400": "#f87171", // red-400
  "bg-orange-100 text-orange-400": "#fb923c", // orange-400
  "bg-amber-100 text-amber-700": "#f59e0b", // amber-700
  "bg-yellow-100 text-yellow-700": "#eab308", // yellow-700
  "bg-green-100 text-green-700": "#22c55e", // green-700
  "bg-emerald-100 text-emerald-700": "#10b981", // emerald-700
};

export const PARAMETER_TYPES = [
  { value: "objectives", label: "Objetivos" },
  { value: "competences", label: "Competencias" },
  { value: "final", label: "Final" },
];
