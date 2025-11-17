import { type ModelComplete } from "@/core/core.interface";
import { VehicleTypeResource } from "./vehicleType.interface";
import { COMMERCIAL_MASTERS_ENDPOINT } from "@/features/ap/lib/ap.constants";

const ROUTE = "tipos-vehiculo";
const ABSOLUTE_ROUTE = `/ap/configuraciones/vehiculos/${ROUTE}`;

export const VEHICLE_TYPE: ModelComplete<VehicleTypeResource> = {
  MODEL: {
    name: "Tipo de Vehículo",
    plural: "Tipos de Vehículo",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: COMMERCIAL_MASTERS_ENDPOINT,
  QUERY_KEY: "vehicleType",
  ROUTE,
  ABSOLUTE_ROUTE,
  EMPTY: {
    id: 0,
    code: "",
    description: "",
    type: "",
    status: true,
  },
};
