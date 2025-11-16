import { ModelComplete } from "@/src/core/core.interface";
import { TypeClientResource } from "./typeClient.interface";
import { COMMERCIAL_MASTERS_ENDPOINT } from "../../../../lib/ap.constants";

const ROUTE = "tipos-persona";

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
  EMPTY: {
    id: 0,
    code: "",
    description: "",
    type: "",
    status: true,
  },
};
