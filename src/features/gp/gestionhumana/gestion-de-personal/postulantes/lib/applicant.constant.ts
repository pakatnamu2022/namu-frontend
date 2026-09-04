import { type ModelComplete } from "@/core/core.interface.ts";

const ROUTE = "postulantes";
const ABSOLUTE_ROUTE = `/gp/gestion-humana/gestion-de-personal/${ROUTE}`;

export const APPLICANT: ModelComplete = {
  MODEL: {
    name: "Postulante",
    plural: "Postulantes",
    gender: false,
  },
  ICON: "Users",
  ENDPOINT: "/gp/gh/reclutamiento/applicant",
  QUERY_KEY: "applicant",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};

export const APPLICANT_TYPE = {
  POSTULANTE: 1,
  CONTRATADO: 2,
  RECHAZADO: 3,
  FUERA_CUPO: 4,
  LISTA_NEGRA: 5,
  SELECCIONADO: 6,
} as const;

export const APPLICANT_STATUS_OPTIONS = [
  { value: String(APPLICANT_TYPE.SELECCIONADO), label: "Seleccionado" },
  { value: String(APPLICANT_TYPE.RECHAZADO), label: "Rechazado" },
  { value: String(APPLICANT_TYPE.FUERA_CUPO), label: "Fuera de cupo" },
  { value: String(APPLICANT_TYPE.LISTA_NEGRA), label: "Lista negra" },
];
