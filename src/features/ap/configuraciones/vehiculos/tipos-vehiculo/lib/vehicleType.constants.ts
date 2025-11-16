import { ModelComplete } from "@/src/core/core.interface";
import { VehicleTypeResource } from "./vehicleType.interface";
import { COMMERCIAL_MASTERS_ENDPOINT } from "@/src/features/ap/lib/ap.constants";

const ROUTE = "tipos-vehiculo";

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
  EMPTY: {
    id: 0,
    code: "",
    description: "",
    type: "",
    status: true,
  },
};
