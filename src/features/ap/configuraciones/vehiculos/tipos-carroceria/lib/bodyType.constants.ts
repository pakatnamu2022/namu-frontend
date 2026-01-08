import { type ModelComplete } from "@/core/core.interface";
import { BodyTypeResource } from "./bodyType.interface";
import { AP_MASTERS } from "@/features/ap/comercial/ap-master/lib/apMaster.constants";

const ROUTE = "tipos-carroceria";
const ABSOLUTE_ROUTE = `/ap/configuraciones/vehiculos/${ROUTE}`;

export const BODY_TYPE: ModelComplete<BodyTypeResource> = {
  MODEL: {
    name: "Tipo de carrocería",
    plural: "Tipos de carrocería",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: AP_MASTERS.ENDPOINT,
  QUERY_KEY: "bodyType",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
  EMPTY: { id: 0, code: "", description: "", type: "", status: true },
};
