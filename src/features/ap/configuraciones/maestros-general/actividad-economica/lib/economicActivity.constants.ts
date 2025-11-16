import { type ModelComplete } from "@/core/core.interface";
import { EconomicActivityResource } from "./economicActivity.interface";
import { COMMERCIAL_MASTERS_ENDPOINT } from "../../../../lib/ap.constants";

const ROUTE = "actividad-economica";

export const ECONOMIC_ACTIVITY: ModelComplete<EconomicActivityResource> = {
  MODEL: {
    name: "Actividad Económica",
    plural: "Actividades Económicas",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: COMMERCIAL_MASTERS_ENDPOINT,
  QUERY_KEY: "economicActivity",
  ROUTE,
  EMPTY: {
    id: 0,
    description: "",
    type: "",
    status: true,
  },
};
