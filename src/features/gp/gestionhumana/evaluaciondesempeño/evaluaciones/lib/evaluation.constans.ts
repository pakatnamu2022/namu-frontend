import { ModelComplete, Option } from "@/core/core.interface";

const ROUTE = "evaluaciones";
export const ABSOLUTE_ROUTE = `/gp/gestion-humana/evaluaciones-de-desempeno/${ROUTE}`;

export const EVALUATION: ModelComplete = {
  MODEL: {
    name: "Evaluación",
    plural: "Evaluaciones",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/gp/gh/performanceEvaluation/evaluation",
  QUERY_KEY: "evaluations",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};

export const EVALUATION_OBJECTIVE = {
  ID: "0",
  NAME: "Evaluación de Objetivos",
};

export const EVALUATION_180 = {
  ID: "1",
  NAME: "Evaluación 180",
};

export const EVALUATION_360 = {
  ID: "2",
  NAME: "Evaluación 360",
};

export const TYPE_EVALUATION = [
  { value: EVALUATION_OBJECTIVE.ID, label: EVALUATION_OBJECTIVE.NAME },
  { value: EVALUATION_180.ID, label: EVALUATION_180.NAME },
  { value: EVALUATION_360.ID, label: EVALUATION_360.NAME },
];

export const TYPE_EVALUATION_VALUES = TYPE_EVALUATION.map(
  (item) => item.value
) as [string, ...string[]];

export type TYPE_EVALUATION_VALUES = (typeof TYPE_EVALUATION_VALUES)[number];

export const STATUS_EVALUATION_PROGRAMED = {
  value: "0",
  label: "Programada",
};
export const STATUS_EVALUATION_IN_PROGRESS = {
  value: "1",
  label: "En Proceso",
};
export const STATUS_EVALUATION_COMPLETED = {
  value: "2",
  label: "Completada",
};

export const STATUS_EVALUATION: Option[] = [
  STATUS_EVALUATION_PROGRAMED,
  STATUS_EVALUATION_IN_PROGRESS,
  STATUS_EVALUATION_COMPLETED,
];
