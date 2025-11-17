import { type ModelComplete } from "@/core/core.interface";
import { FamiliesSchema } from "./families.schema";

const ROUTE = "familias";
const ABSOLUTE_ROUTE = `/ap/configuration/${ROUTE}`;

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
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `./agregar`,
  ROUTE_UPDATE: `./actualizar`,
  EMPTY: {
    brand_id: "",
    description: "",
    status: true,
  },
};
