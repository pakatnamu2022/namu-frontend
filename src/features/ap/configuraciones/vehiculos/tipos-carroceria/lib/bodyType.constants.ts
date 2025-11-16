import { type ModelComplete } from "@/core/core.interface";
import { BodyTypeResource } from "./bodyType.interface";
import { COMMERCIAL_MASTERS_ENDPOINT } from "@/features/ap/lib/ap.constants";

const ROUTE = "tipos-carroceria";

export const BODY_TYPE: ModelComplete<BodyTypeResource> = {
  MODEL: {
    name: "Tipo de carrocería",
    plural: "Tipos de carrocería",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: COMMERCIAL_MASTERS_ENDPOINT,
  QUERY_KEY: "bodyType",
  ROUTE,
  EMPTY: { id: 0, code: "", description: "", type: "", status: true },
};
