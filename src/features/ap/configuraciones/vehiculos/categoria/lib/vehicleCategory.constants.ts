import { type ModelComplete } from "@/core/core.interface";
import { VehicleCategoryResource } from "./vehicleCategory.interface";
import { COMMERCIAL_MASTERS_ENDPOINT } from "@/features/ap/lib/ap.constants";

const ROUTE = "categorias";

export const VEHICLE_CATEGORY: ModelComplete<VehicleCategoryResource> = {
  MODEL: {
    name: "Categoria de vehículo",
    plural: "Categorias de vehículo",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: COMMERCIAL_MASTERS_ENDPOINT,
  QUERY_KEY: "commercialMasters",
  ROUTE,
  EMPTY: { id: 0, description: "", type: "", status: true },
};
