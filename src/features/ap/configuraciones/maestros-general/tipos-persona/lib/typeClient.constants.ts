import { type ModelComplete } from "@/core/core.interface";
import { TypeClientResource } from "./typeClient.interface";
import { COMMERCIAL_MASTERS_ENDPOINT } from "../../../../lib/ap.constants";

const ROUTE = "tipos-persona";
const ABSOLUTE_ROUTE = `/ap/configuraciones/maestros-general/${ROUTE}`;

export const TYPE_PERSON: ModelComplete<TypeClientResource> = {
  MODEL: {
    name: "Tipo Persona",
    plural: "Tipos Persona",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: COMMERCIAL_MASTERS_ENDPOINT,
  QUERY_KEY: "typePerson",
  ROUTE,
  ABSOLUTE_ROUTE,
  EMPTY: {
    id: 0,
    code: "",
    description: "",
    type: "",
    status: true,
  },
};
