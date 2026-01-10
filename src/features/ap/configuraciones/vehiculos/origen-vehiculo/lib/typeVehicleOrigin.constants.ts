import { type ModelComplete } from "@/core/core.interface";
import { TypeVehicleOriginResource } from "./typeVehicleOrigin.interface";
import { AP_MASTERS } from "@/features/ap/ap-master/lib/apMaster.constants";

const ROUTE = "origen-vehiculo";
const ABSOLUTE_ROUTE = `/ap/configuration/vehiculos/${ROUTE}`;

export const VEHICLE_ORIGIN: ModelComplete<TypeVehicleOriginResource> = {
  MODEL: {
    name: "Origen de vehículo",
    plural: "Origenes de vehículo",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: AP_MASTERS.ENDPOINT,
  QUERY_KEY: "typeVehicleOrigin",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
  EMPTY: { id: 0, code: "", description: "", type: "", status: true },
};
