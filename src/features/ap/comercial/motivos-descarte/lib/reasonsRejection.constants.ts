import { type ModelComplete } from "@/core/core.interface";
import { AP_MASTERS } from "@/features/ap/comercial/ap-master/lib/apMaster.constants";
import { ReasonsRejectionResource } from "./reasonsRejection.interface";

const ROUTE = "motivos-descarte";
const ABSOLUTE_ROUTE = `/ap/comercial/${ROUTE}`;

export const REASONS_REJECTION: ModelComplete<ReasonsRejectionResource> = {
  MODEL: {
    name: "Motivo de descarte",
    plural: "Motivos de descarte",
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
