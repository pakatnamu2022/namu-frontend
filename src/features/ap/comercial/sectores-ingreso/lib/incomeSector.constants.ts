import { type ModelComplete } from "@/core/core.interface";
import { COMMERCIAL_MASTERS_ENDPOINT } from "@/features/ap/lib/ap.constants";
import { IncomeSectorResource } from "./incomeSector.interface";

const ROUTE = "categorias";

export const INCOME_SECTOR: ModelComplete<IncomeSectorResource> = {
  MODEL: {
    name: "Sector de ingreso",
    plural: "Sectores de ingreso",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: COMMERCIAL_MASTERS_ENDPOINT,
  QUERY_KEY: "commercialMasters",
  ROUTE,
  EMPTY: { id: 0, description: "", type: "", status: true },
};
