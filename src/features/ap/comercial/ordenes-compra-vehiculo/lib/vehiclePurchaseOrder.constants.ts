import { type ModelComplete } from "@/core/core.interface";

const ROUTE = "compra-vehiculo-nuevo";
const ABSOLUTE_ROUTE = `/ap/comercial/${ROUTE}`;

export const VEHICLE_PURCHASE_ORDER: ModelComplete = {
  MODEL: {
    name: "Orden de Compra de Vehículo",
    plural: "Órdenes de Compra de Vehículos",
    gender: false,
  },
  ICON: "ShoppingCart",
  ENDPOINT: "/ap/commercial/vehiclePurchaseOrder",
  QUERY_KEY: "vehiclePurchaseOrder",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/editar`,
};
