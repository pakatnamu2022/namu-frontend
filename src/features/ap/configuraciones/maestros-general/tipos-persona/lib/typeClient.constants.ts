import { type ModelComplete } from "@/core/core.interface";
import { TypeClientResource } from "./typeClient.interface";
import { AP_MASTERS } from "@/features/ap/ap-master/lib/apMaster.constants";

const ROUTE = "tipos-persona";
const ABSOLUTE_ROUTE = `/ap/configuraciones/maestros-general/${ROUTE}`;

export const TYPE_PERSON: ModelComplete<TypeClientResource> = {
  MODEL: {
    name: "Tipo Persona",
    plural: "Tipos Persona",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: AP_MASTERS.ENDPOINT,
  QUERY_KEY: "typePerson",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
  EMPTY: {
    id: 0,
    code: "",
    description: "",
    type: "",
    status: true,
  },
};
