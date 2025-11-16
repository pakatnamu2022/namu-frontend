import { ModelComplete } from "@/src/core/core.interface";
import { VehicleSchema } from "./vehicles.schema";

const ROUTE = "vehiculos";

export const VEHICLES: ModelComplete<VehicleSchema> = {
  MODEL: {
    name: "Vehículo",
    plural: "Vehículos",
    gender: true,
  },
  ICON: "Car",
  ENDPOINT: "/ap/commercial/vehicles",
  QUERY_KEY: "vehicles",
  ROUTE,
  EMPTY: {
    vin: "",
    year: new Date().getFullYear(),
    engine_number: "",
    ap_models_vn_id: "",
    vehicle_color_id: "",
    engine_type_id: "",
  },
};
