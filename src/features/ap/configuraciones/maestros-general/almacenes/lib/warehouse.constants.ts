import { type ModelComplete } from "@/core/core.interface";
import { WarehouseResource } from "./warehouse.interface";

const ROUTE = "almacenes";
const ABSOLUTE_ROUTE = `/ap/configuraciones/maestros-general/${ROUTE}`;

export const WAREHOUSE: ModelComplete<WarehouseResource> = {
  MODEL: {
    name: "Almacén",
    plural: "Almacenes",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/ap/configuration/warehouse",
  QUERY_KEY: "warehouse",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};
