import { ModelComplete } from "@/core/core.interface";
import { ModelsVnResource } from "./modelsVn.interface";

const ROUTE = "modelos-vn";

export const MODELS_VN: ModelComplete<ModelsVnResource> = {
  MODEL: {
    name: "Modelo VN",
    plural: "Modelos VN",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/ap/configuration/modelsVn",
  QUERY_KEY: "modelsVn",
  ROUTE,
  ROUTE_ADD: `${ROUTE}/agregar`,
  ROUTE_UPDATE: `${ROUTE}/actualizar`,
};
