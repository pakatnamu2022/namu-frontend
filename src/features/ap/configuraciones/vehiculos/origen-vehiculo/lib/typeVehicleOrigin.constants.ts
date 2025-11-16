import { ModelComplete } from "@/core/core.interface";
import { TypeVehicleOriginResource } from "./typeVehicleOrigin.interface";
import { COMMERCIAL_MASTERS_ENDPOINT } from "@/features/ap/lib/ap.constants";

const ROUTE = "origen-vehiculo";

export const VEHICLE_ORIGIN: ModelComplete<TypeVehicleOriginResource> = {
  MODEL: {
    name: "Origen de vehículo",
    plural: "Origenes de vehículo",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: COMMERCIAL_MASTERS_ENDPOINT,
  QUERY_KEY: "typeVehicleOrigin",
  ROUTE,
  EMPTY: { id: 0, code: "", description: "", type: "", status: true },
};
