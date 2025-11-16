import { ModelComplete } from "@/core/core.interface";
import { FamiliesSchema } from "./families.schema";

const ROUTE = "familias";

export const FAMILIES: ModelComplete<FamiliesSchema> = {
  MODEL: {
    name: "Familia",
    plural: "Familias",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/ap/configuration/families",
  QUERY_KEY: "families",
  ROUTE,
  ROUTE_ADD: `${ROUTE}/agregar`,
  ROUTE_UPDATE: `${ROUTE}/actualizar`,
  EMPTY: {
    brand_id: "",
    description: "",
    status: true,
  },
};
