import { type ModelComplete } from "@/core/core.interface";
import { COMMERCIAL_MASTERS_ENDPOINT } from "@/features/ap/lib/ap.constants";
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
  ENDPOINT: COMMERCIAL_MASTERS_ENDPOINT,
  QUERY_KEY: "commercialMasters",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/editar`,
  EMPTY: { id: 0, description: "", type: "", status: true },
};
