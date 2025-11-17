import { type ModelComplete } from "@/core/core.interface";
import { WarehouseResource } from "./warehouse.interface";

const ROUTE = "almacenes";

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
  ROUTE_ADD: `./agregar`,
  ROUTE_UPDATE: `./actualizar`,
};

