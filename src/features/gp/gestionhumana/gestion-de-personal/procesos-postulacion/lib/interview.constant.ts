import { type ModelComplete, type Option } from "@/core/core.interface.ts";

export const INTERVIEW_PHASE = {
  RRHH: 1,
  JEFE: 2,
} as const;

export const INTERVIEW_PHASE_OPTIONS: Option[] = [
  { value: String(INTERVIEW_PHASE.RRHH), label: "Entrevista RRHH" },
  { value: String(INTERVIEW_PHASE.JEFE), label: "Entrevista con jefe" },
];

const ROUTE = "entrevistas";
const ABSOLUTE_ROUTE = `/gp/gestion-humana/gestion-de-personal/procesos-postulacion/${ROUTE}`;

export const INTERVIEW: ModelComplete = {
  MODEL: {
    name: "Entrevista",
    plural: "Entrevistas",
    gender: false,
  },
  ICON: "MessageSquareQuote",
  ENDPOINT: "/gp/gh/reclutamiento/interview",
  QUERY_KEY: "interview",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};

export const PROCESS_COMPETENCE_ENDPOINT = (processId: number | string) =>
  `/gp/gh/reclutamiento/recruitment-process/${processId}/competences`;
