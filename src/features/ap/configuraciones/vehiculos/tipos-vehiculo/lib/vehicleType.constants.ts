import { type ModelComplete } from "@/core/core.interface";
import { VehicleTypeResource } from "./vehicleType.interface";
import { AP_MASTERS } from "@/features/ap/ap-master/lib/apMaster.constants";

const ROUTE = "tipos-vehiculo";
const ABSOLUTE_ROUTE = `/ap/configuraciones/vehiculos/${ROUTE}`;

export const VEHICLE_TYPE: ModelComplete<VehicleTypeResource> = {
  MODEL: {
    name: "Tipo de Vehículo",
    plural: "Tipos de Vehículo",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: AP_MASTERS.ENDPOINT,
  QUERY_KEY: "vehicleType",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
  EMPTY: {
    id: 0,
    code: "",
    description: "",
    type: "",
    status: true,
  },
};
