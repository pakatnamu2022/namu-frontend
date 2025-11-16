import { ModelComplete } from "@/src/core/core.interface";
import { COMMERCIAL_MASTERS_ENDPOINT } from "@/src/features/ap/lib/ap.constants";
import { ReasonsRejectionResource } from "./reasonsRejection.interface";

const ROUTE = "motivos-descarte";

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
  EMPTY: { id: 0, description: "", type: "", status: true },
};
