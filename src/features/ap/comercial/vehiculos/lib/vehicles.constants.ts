import { type ModelComplete } from "@/core/core.interface";
import { VehicleResource } from "./vehicles.interface";

// VEHICULOS COMERCIAL
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

// VEHICULOS TALLER
const ROUTE_TLL = "vehiculos-taller";
const ABSOLUTE_ROUTE_TLL = `/ap/post-venta/taller/${ROUTE_TLL}`;

export const VEHICLES_PV: ModelComplete<VehicleResource> = {
  MODEL: {
    name: "Vehículo Post Venta",
    plural: "Vehículos Post Venta",
    gender: true,
  },
  ICON: "Car",
  ENDPOINT: "/ap/commercial/vehicles",
  QUERY_KEY: "vehicles-post-venta",
  ROUTE: ROUTE_TLL,
  ABSOLUTE_ROUTE: ABSOLUTE_ROUTE_TLL,
  ROUTE_ADD: `${ABSOLUTE_ROUTE_TLL}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE_TLL}/actualizar`,
};

// VEHICULOS REPUESTOS
const ROUTE_RP = "vehiculos-repuestos";
const ABSOLUTE_ROUTE_RP = `/ap/post-venta/repuestos/${ROUTE_RP}`;

export const VEHICLES_RP: ModelComplete<VehicleResource> = {
  MODEL: {
    name: "Vehículo Repuestos",
    plural: "Vehículos Repuestos",
    gender: true,
  },
  ICON: "Car",
  ENDPOINT: "/ap/commercial/vehicles",
  QUERY_KEY: "vehicles-repuestos",
  ROUTE: ROUTE_RP,
  ABSOLUTE_ROUTE: ABSOLUTE_ROUTE_RP,
  ROUTE_ADD: `${ABSOLUTE_ROUTE_RP}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE_RP}/actualizar`,
};
