import { type ModelComplete } from "@/core/core.interface";
import { ParentWarehouseResource } from "./parentWarehouse.interface";

const ROUTE = "almacenes-padre";
const ABSOLUTE_ROUTE = `/ap/configuraciones/maestros-general/${ROUTE}`;

export const PARENT_WAREHOUSE: ModelComplete<ParentWarehouseResource> = {
  MODEL: {
    name: "Almacén Padre",
    plural: "Almacenes Padre",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/ap/configuration/headerWarehouse",
  QUERY_KEY: "parent-warehouse",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};
