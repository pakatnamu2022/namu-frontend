import { type ModelComplete } from "@/core/core.interface";
import { PersonSegmentResource } from "./personSegment.interface";
import { COMMERCIAL_MASTERS_ENDPOINT } from "../../../../lib/ap.constants";

const ROUTE = "segmentos-persona";
const ABSOLUTE_ROUTE = `/ap/configuraciones/maestros-general/${ROUTE}`;

export const PERSON_SEGMENT: ModelComplete<PersonSegmentResource> = {
  MODEL: {
    name: "Segmento Persona",
    plural: "Segmentos Persona",
    gender: false,
  },
  ICON: "ContactRound",
  ENDPOINT: COMMERCIAL_MASTERS_ENDPOINT,
  QUERY_KEY: "personSegment",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/editar`,
  EMPTY: {
    id: 0,
    description: "",
    type: "",
    status: true,
  },
};
