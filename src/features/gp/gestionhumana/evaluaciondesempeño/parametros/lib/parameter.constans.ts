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
  "bg-red-100 text-red-600": "#f87171", // red-400
  "bg-orange-100 text-orange-600": "#fb923c", // orange-400
  "bg-amber-100 text-amber-600": "#fbbf24", // amber-400
  "bg-yellow-100 text-yellow-600": "#facc15", // yellow-400
  "bg-green-100 text-green-600": "#4ade80", // green-400
  "bg-emerald-100 text-emerald-600": "#34d399", // emerald-400
};

export const PARAMETER_TYPES = [
  { value: "objectives", label: "Objetivos" },
  { value: "competences", label: "Competencias" },
  { value: "final", label: "Final" },
];
