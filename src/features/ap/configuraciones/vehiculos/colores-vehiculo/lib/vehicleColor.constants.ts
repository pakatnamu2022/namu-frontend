import { ModelComplete } from "@/core/core.interface";
import { VehicleColorResource } from "./vehicleColor.interface";
import { COMMERCIAL_MASTERS_ENDPOINT } from "@/features/ap/lib/ap.constants";

const ROUTE = "colores-vehiculo";

export const VEHICLE_COLOR: ModelComplete<VehicleColorResource> = {
  MODEL: {
    name: "Color de vehículo",
    plural: "Colores de vehículo",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: COMMERCIAL_MASTERS_ENDPOINT,
  QUERY_KEY: "vehicleColor",
  ROUTE,
  EMPTY: { id: 0, code: "", description: "", type: "", status: true },
};
