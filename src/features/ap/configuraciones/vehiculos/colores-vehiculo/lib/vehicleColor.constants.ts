import { type ModelComplete } from "@/core/core.interface";
import { VehicleColorResource } from "./vehicleColor.interface";
import { AP_MASTERS } from "@/features/ap/comercial/ap-master/lib/apMaster.constants";

const ROUTE = "colores-vehiculo";
const ABSOLUTE_ROUTE = `/ap/configuraciones/vehiculos/${ROUTE}`;

export const VEHICLE_COLOR: ModelComplete<VehicleColorResource> = {
  MODEL: {
    name: "Color de vehículo",
    plural: "Colores de vehículo",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: AP_MASTERS.ENDPOINT,
  QUERY_KEY: "vehicleColor",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
  EMPTY: { id: 0, code: "", description: "", type: "", status: true },
};
