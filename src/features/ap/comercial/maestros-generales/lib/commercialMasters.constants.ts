import { type ModelComplete } from "@/core/core.interface";
import { COMMERCIAL_MASTERS_ENDPOINT } from "@/features/ap/lib/ap.constants";
import { CommercialMastersResource } from "./commercialMasters.interface";

const ROUTE = "maestros-generales";
const ABSOLUTE_ROUTE = `/ap/comercial/${ROUTE}`;

export const COMMERCIAL_MASTERS: ModelComplete<CommercialMastersResource> = {
  MODEL: {
    name: "Maestro Comercial",
    plural: "Maestros Comerciales",
    gender: true,
  },
  ICON: "Database",
  ENDPOINT: COMMERCIAL_MASTERS_ENDPOINT,
  QUERY_KEY: "commercialMastersGenerales",
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
