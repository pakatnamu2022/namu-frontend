import { type ModelComplete } from "@/core/core.interface";
import { CustomersResource } from "./customers.interface";

// RUTA PARA COMERCIAL - CLIENTES
const ROUTE = "clientes";
const ABSOLUTE_ROUTE = `/ap/comercial/${ROUTE}`;

export const CUSTOMERS: ModelComplete<CustomersResource> = {
  MODEL: {
    name: "Cliente",
    plural: "Clientes",
    gender: false,
  },
  ICON: "ContactRound",
  ENDPOINT: "/ap/commercial/businessPartners",
  QUERY_KEY: "customers",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};

// RUTA PARA TALLER - CLIENTES

const ROUTE_TLL = "clientes-taller";
const ABSOLUTE_ROUTE_TLL = `/ap/post-venta/taller/${ROUTE_TLL}`;

export const CUSTOMERS_PV: ModelComplete<CustomersResource> = {
  MODEL: {
    name: "Cliente Taller",
    plural: "Clientes Taller",
    gender: false,
  },
  ICON: "ContactRound",
  ENDPOINT: "/ap/commercial/businessPartners",
  QUERY_KEY: "customers-pv",
  ROUTE: ROUTE_TLL,
  ABSOLUTE_ROUTE: ABSOLUTE_ROUTE_TLL,
  ROUTE_ADD: `${ABSOLUTE_ROUTE_TLL}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE_TLL}/actualizar`,
};

// RUTAS PARA REPUESTOS - CLIENTES
const ROUTE_RP = "clientes-repuestos";
const ABSOLUTE_ROUTE_RP = `/ap/post-venta/repuestos/${ROUTE_RP}`;

export const CUSTOMERS_RP: ModelComplete<CustomersResource> = {
  MODEL: {
    name: "Cliente Repuestos",
    plural: "Clientes Repuestos",
    gender: false,
  },
  ICON: "ContactRound",
  ENDPOINT: "/ap/commercial/businessPartners",
  QUERY_KEY: "customers-rp",
  ROUTE: ROUTE_RP,
  ABSOLUTE_ROUTE: ABSOLUTE_ROUTE_RP,
  ROUTE_ADD: `${ABSOLUTE_ROUTE_RP}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE_RP}/actualizar`,
};
