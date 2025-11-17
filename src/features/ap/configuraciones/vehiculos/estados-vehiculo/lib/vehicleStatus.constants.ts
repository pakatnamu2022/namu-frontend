import { type ModelComplete } from "@/core/core.interface";
import { VehicleStatusResource } from "./vehicleStatus.interface";

const ROUTE = "estados-vehiculo";
const ABSOLUTE_ROUTE = `/ap/configuraciones/vehiculos/${ROUTE}`;

export const VEHICLE_STATUS: ModelComplete<VehicleStatusResource> = {
  MODEL: {
    name: "Estado de Vehículo",
    plural: "Estados de Vehículo",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/ap/configuration/vehicleStatus",
  QUERY_KEY: "vehicleStatus",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
  EMPTY: {
    id: 0,
    code: "",
    description: "",
    use: "",
    color: "",
    status: true,
  },
};

export const VEHICLE_STATUS_USE = {
  PVN: 1,
  VTR: 2,
  VTD: 3,
  VNE: 4,
  IVN: 5,
  VEN: 6,
};
