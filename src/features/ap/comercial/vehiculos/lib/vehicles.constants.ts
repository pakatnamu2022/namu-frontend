import { type ModelComplete } from "@/core/core.interface";
import { VehicleResource } from "./vehicles.interface";

const ROUTE = "vehiculos";
const ABSOLUTE_ROUTE = `/ap/comercial/${ROUTE}`;

export const VEHICLES: ModelComplete<VehicleResource> = {
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
};

const ROUTE_PV = "vehiculos-post-venta";
const ABSOLUTE_ROUTE_PV = `/ap/post-venta/taller/${ROUTE_PV}`;

export const VEHICLES_PV: ModelComplete<VehicleResource> = {
  MODEL: {
    name: "Vehículo Post Venta",
    plural: "Vehículos Post Venta",
    gender: true,
  },
  ICON: "Car",
  ENDPOINT: "/ap/commercial/vehicles",
  QUERY_KEY: "vehicles-post-venta",
  ROUTE: ROUTE_PV,
  ABSOLUTE_ROUTE: ABSOLUTE_ROUTE_PV,
  ROUTE_ADD: `${ABSOLUTE_ROUTE_PV}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE_PV}/actualizar`,
};
