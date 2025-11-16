import { ModelComplete } from "@/core/core.interface";
import { BrandsResource } from "./brands.interface";

const ROUTE = "marcas";

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
  ROUTE_ADD: `${ROUTE}/agregar`,
  ROUTE_UPDATE: `${ROUTE}/actualizar`,
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
  ROUTE_ADD: `${ROUTE_POSTVENTA}/agregar`,
  ROUTE_UPDATE: `${ROUTE_POSTVENTA}/actualizar`,
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
