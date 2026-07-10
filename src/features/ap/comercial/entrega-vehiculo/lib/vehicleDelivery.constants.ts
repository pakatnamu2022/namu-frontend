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

export const ROUTE_GUIA_SALIDA = `${ABSOLUTE_ROUTE}/guia-salida`;

// Horarios permitidos para la entrega programada del vehículo.
// Lunes a viernes: 7 horarios. Sábado: 3 horarios. Domingo: no atiende.
export const DELIVERY_WEEKDAY_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "15:00",
  "16:00",
  "17:00",
];

export const DELIVERY_SATURDAY_SLOTS = ["10:00", "11:00", "12:00"];

export const getDeliverySlotsForDay = (date: Date): string[] => {
  const day = date.getDay(); // 0 domingo, 6 sábado
  if (day === 0) return [];
  if (day === 6) return DELIVERY_SATURDAY_SLOTS;
  return DELIVERY_WEEKDAY_SLOTS;
};
