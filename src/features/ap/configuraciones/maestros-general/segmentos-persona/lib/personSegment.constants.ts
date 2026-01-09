import { type ModelComplete } from "@/core/core.interface";
import { PersonSegmentResource } from "./personSegment.interface";
import { AP_MASTERS } from "@/features/ap/ap-master/lib/apMaster.constants";

const ROUTE = "segmentos-persona";
const ABSOLUTE_ROUTE = `/ap/configuraciones/maestros-general/${ROUTE}`;

export const PERSON_SEGMENT: ModelComplete<PersonSegmentResource> = {
  MODEL: {
    name: "Segmento Persona",
    plural: "Segmentos Persona",
    gender: false,
  },
  ICON: "ContactRound",
  ENDPOINT: AP_MASTERS.ENDPOINT,
  QUERY_KEY: "personSegment",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
  EMPTY: {
    id: 0,
    description: "",
    type: "",
    status: true,
  },
};
