import { type ModelComplete } from "@/core/core.interface.ts";

const ROUTE = "procesos-postulacion";
const ABSOLUTE_ROUTE = `/gp/gestion-humana/gestion-de-personal/${ROUTE}`;

export const RECRUITMENT_PROCESS: ModelComplete = {
  MODEL: {
    name: "Proceso de Postulación",
    plural: "Procesos de Postulación",
    gender: false,
  },
  ICON: "ClipboardList",
  ENDPOINT: "/gp/gh/reclutamiento/recruitment-process",
  QUERY_KEY: "recruitmentProcess",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};

export const RECRUITMENT_PROCESS_PRIORITY = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
} as const;

export const RECRUITMENT_PROCESS_PRIORITY_OPTIONS = [
  { value: String(RECRUITMENT_PROCESS_PRIORITY.LOW), label: "Baja" },
  { value: String(RECRUITMENT_PROCESS_PRIORITY.MEDIUM), label: "Media" },
  { value: String(RECRUITMENT_PROCESS_PRIORITY.HIGH), label: "Alta" },
];

export const RECRUITMENT_PROCESS_STATUS = {
  OPEN: 9,
  IN_PROCESS: 10,
  CLOSED: 11,
} as const;
