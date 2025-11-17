import { type ModelComplete } from "@/core/core.interface";
import { ModelsVnResource } from "./modelsVn.interface";

const ROUTE = "modelos-vn";
const ABSOLUTE_ROUTE = `/ap/configuraciones/vehiculos/${ROUTE}`;

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
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};
