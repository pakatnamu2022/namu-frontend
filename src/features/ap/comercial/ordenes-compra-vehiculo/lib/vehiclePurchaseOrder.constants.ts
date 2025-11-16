import { type ModelComplete } from "@/core/core.interface";

const ROUTE = "compra-vehiculo-nuevo";

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
  ROUTE_ADD: `${ROUTE}/agregar`,
  ROUTE_UPDATE: `${ROUTE}/actualizar`,
};
