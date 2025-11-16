import { ModelComplete } from "@/core/core.interface";
import { BrandGroupResource } from "./brandGroup.interface";
import { COMMERCIAL_MASTERS_ENDPOINT } from "@/features/ap/lib/ap.constants";

const ROUTE = "grupo-marcas";

export const BRAND_GROUP: ModelComplete<BrandGroupResource> = {
  MODEL: {
    name: "Grupo de marca",
    plural: "Grupos de marca",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: COMMERCIAL_MASTERS_ENDPOINT,
  QUERY_KEY: "brandGroup",
  ROUTE,
  ROUTE_ADD: `${ROUTE}/agregar`,
  ROUTE_UPDATE: `${ROUTE}/actualizar`,
  EMPTY: {
    id: 0,
    code: "",
    description: "",
    type: "",
    status: true,
  },
};
