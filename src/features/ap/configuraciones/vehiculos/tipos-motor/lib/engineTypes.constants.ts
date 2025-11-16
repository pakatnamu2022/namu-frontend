import { ModelComplete } from "@/core/core.interface";
import { EngineTypesResource } from "./engineTypes.interface";
import { COMMERCIAL_MASTERS_ENDPOINT } from "@/features/ap/lib/ap.constants";

const ROUTE = "tipos-motor";

export const ENGINE_TYPES: ModelComplete<EngineTypesResource> = {
  MODEL: {
    name: "Tipo de Motor",
    plural: "Tipos de Motor",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: COMMERCIAL_MASTERS_ENDPOINT,
  QUERY_KEY: "engineTypes",
  ROUTE,
  EMPTY: {
    id: 0,
    code: "",
    description: "",
    type: "",
    status: true,
  },
};
