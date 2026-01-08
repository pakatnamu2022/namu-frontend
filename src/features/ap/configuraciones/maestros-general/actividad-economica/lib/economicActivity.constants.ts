import { type ModelComplete } from "@/core/core.interface";
import { EconomicActivityResource } from "./economicActivity.interface";
import { AP_MASTERS } from "@/features/ap/comercial/ap-master/lib/apMaster.constants";

const ROUTE = "actividad-economica";
const ABSOLUTE_ROUTE = `/ap/configuraciones/maestros-general/${ROUTE}`;

export const ECONOMIC_ACTIVITY: ModelComplete<EconomicActivityResource> = {
  MODEL: {
    name: "Actividad Económica",
    plural: "Actividades Económicas",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: AP_MASTERS.ENDPOINT,
  QUERY_KEY: "economicActivity",
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
