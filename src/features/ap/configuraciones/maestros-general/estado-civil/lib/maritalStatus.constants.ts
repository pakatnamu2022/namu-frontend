import { type ModelComplete } from "@/core/core.interface";
import { MaritalStatusResource } from "./maritalStatus.interface";
import { COMMERCIAL_MASTERS_ENDPOINT } from "../../../../lib/ap.constants";

const ROUTE = "origen-cliente";
const ABSOLUTE_ROUTE = `/ap/configuraciones/maestros-general/${ROUTE}`;

export const MARITAL_STATUS: ModelComplete<MaritalStatusResource> = {
  MODEL: {
    name: "Estado Civil",
    plural: "Estados Civiles",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: COMMERCIAL_MASTERS_ENDPOINT,
  QUERY_KEY: "maritalStatus",
  ROUTE,
  ABSOLUTE_ROUTE,
  EMPTY: {
    id: 0,
    description: "",
    type: "",
    status: true,
  },
};
