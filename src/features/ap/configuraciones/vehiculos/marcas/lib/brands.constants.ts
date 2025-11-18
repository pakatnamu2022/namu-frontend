import { type ModelComplete } from "@/core/core.interface";
import { BrandsResource } from "./brands.interface";

const ROUTE = "marcas";
const ABSOLUTE_ROUTE = `/ap/configuraciones/vehiculos/${ROUTE}`;

export const BRAND: ModelComplete<BrandsResource> = {
  MODEL: {
    name: "Marca de Vehículo",
    plural: "Marcas de Vehículo",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/ap/configuration/vehicleBrand",
  QUERY_KEY: "vehicleBrand",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `./agregar`,
  ROUTE_UPDATE: `./actualizar`,
  EMPTY: {
    id: 0,
    code: "",
    dyn_code: "",
    name: "",
    description: "",
    logo_url: "",
    logo_min_url: "",
    group_id: 0,
    status: true,
    is_commercial: true,
  },
};

const ROUTE_POSTVENTA = "marcas-producto";
const ABSOLUTE_ROUTE_POSTVENTA = `/ap/post-venta/gestion-de-productos/${ROUTE_POSTVENTA}`;

export const BRAND_POSTVENTA: ModelComplete<BrandsResource> = {
  MODEL: {
    name: "Marca de Vehículo",
    plural: "Marcas de Vehículo",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/ap/configuration/vehicleBrand",
  QUERY_KEY: "vehicleBrand",
  ROUTE: ROUTE_POSTVENTA,
  ABSOLUTE_ROUTE: ABSOLUTE_ROUTE_POSTVENTA,
  ROUTE_ADD: `${ABSOLUTE_ROUTE_POSTVENTA}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE_POSTVENTA}/actualizar`,
  EMPTY: {
    id: 0,
    code: "",
    dyn_code: "",
    name: "",
    description: "",
    logo_url: "",
    logo_min_url: "",
    group_id: 0,
    status: true,
    is_commercial: false,
  },
};
