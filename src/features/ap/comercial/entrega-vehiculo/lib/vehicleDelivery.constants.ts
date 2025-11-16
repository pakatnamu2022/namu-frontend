import { ModelComplete } from "@/src/core/core.interface";
import { VehiclesDeliveryResource } from "./vehicleDelivery.interface";

const ROUTE = "entrega-vehiculo";
export const CARD_WASH_ROUTE = "lavado-vehiculo";

export const VEHICLE_DELIVERY: ModelComplete<VehiclesDeliveryResource> = {
  MODEL: {
    name: "Entrega de Vehículo",
    plural: "Entregas de Vehículos",
    gender: false,
  },
  ICON: "ContactRound",
  ENDPOINT: "/ap/commercial/vehiclesDelivery",
  QUERY_KEY: "vehicleDelivery",
  ROUTE,
  ROUTE_ADD: `${ROUTE}/agregar`,
};
