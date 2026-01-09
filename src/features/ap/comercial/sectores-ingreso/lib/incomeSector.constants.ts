import { type ModelComplete } from "@/core/core.interface";
import { IncomeSectorResource } from "./incomeSector.interface";
import { AP_MASTERS } from "../../../ap-master/lib/apMaster.constants";

const ROUTE = "categorias";
const ABSOLUTE_ROUTE = `/ap/comercial/sectores-ingreso/${ROUTE}`;

export const INCOME_SECTOR: ModelComplete<IncomeSectorResource> = {
  MODEL: {
    name: "Sector de ingreso",
    plural: "Sectores de ingreso",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: AP_MASTERS.ENDPOINT,
  QUERY_KEY: "commercialMasters",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
  EMPTY: { id: 0, description: "", type: "", status: true },
};
