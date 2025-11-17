import { type ModelComplete } from "@/core/core.interface";
import { TractionTypeResource } from "./tractionType.interface";
import { COMMERCIAL_MASTERS_ENDPOINT } from "@/features/ap/lib/ap.constants";

const ROUTE = "tipos-traccion";
const ABSOLUTE_ROUTE = `/ap/configuraciones/vehiculos/${ROUTE}`;

export const TRACTION_TYPE: ModelComplete<TractionTypeResource> = {
  MODEL: {
    name: "Tipo de tracción",
    plural: "Tipos de tracción",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: COMMERCIAL_MASTERS_ENDPOINT,
  QUERY_KEY: "tractionType",
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
