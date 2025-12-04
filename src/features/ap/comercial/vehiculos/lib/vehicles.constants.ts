import { type ModelComplete } from "@/core/core.interface";

const ROUTE = "vehiculos";
const ABSOLUTE_ROUTE = `/ap/comercial/${ROUTE}`;

export const VEHICLES: ModelComplete = {
  MODEL: {
    name: "Vehículo",
    plural: "Vehículos",
    gender: true,
  },
  ICON: "Car",
  ENDPOINT: "/ap/commercial/vehicles",
  QUERY_KEY: "vehicles",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
  EMPTY: {
    id: 0,
    vin: "",
    plate: "",
    year: new Date().getFullYear(),
    engine_number: "",
    ap_models_vn_id: 0,
    vehicle_color_id: 0,
    engine_type_id: 0,
    vehicle_color: "",
    engine_type: "",
    status: true,
    ap_vehicle_status_id: 0,
    vehicle_status: "",
    status_color: "",
    warehouse_id: 0,
    warehouse_name: "",
    warehouse_physical_id: 0,
    warehouse_physical_name: "",
    sede_name_warehouse_physical: "",
    sede_name_warehouse: "",
    model: {} as ModelsVnResource,
    movements: [],
    billed_cost: 0,
    freight_cost: 0,
  },
};
