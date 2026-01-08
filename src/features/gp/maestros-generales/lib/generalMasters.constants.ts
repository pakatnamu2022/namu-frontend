import { type ModelComplete } from "@/core/core.interface";
import { GENERAL_MASTERS_ENDPOINT } from "@/features/gp/lib/gp.constants";
import { GeneralMastersResource } from "./generalMasters.interface";

const ROUTE = "maestros-generales";
const ABSOLUTE_ROUTE = `/gp/${ROUTE}`;

export const GENERAL_MASTERS: ModelComplete<GeneralMastersResource> = {
  MODEL: {
    name: "Maestro General",
    plural: "Maestros Generales",
    gender: true,
  },
  ICON: "Database",
  ENDPOINT: GENERAL_MASTERS_ENDPOINT,
  QUERY_KEY: "generalMasters",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
  EMPTY: {
    id: 0,
    code: "",
    description: "",
    type: "",
    value: "",
    status: 1,
  },
};
