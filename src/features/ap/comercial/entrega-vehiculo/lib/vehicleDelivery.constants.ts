import { type ModelComplete } from "@/core/core.interface";
import { type VehiclesDeliveryResource } from "./vehicleDelivery.interface";

const ROUTE = "entrega-vehiculo";
export const CARD_WASH_ROUTE = "lavado-vehiculo";
const ABSOLUTE_ROUTE = `/ap/comercial/${ROUTE}`;

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
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};
