import { type ModelComplete } from "@/core/core.interface";
import { CustomersResource } from "./customers.interface";

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

const ROUTE_PV = "clientes-post-venta";
const ABSOLUTE_ROUTE_PV = `/ap/post-venta/taller/${ROUTE_PV}`;

export const CUSTOMERS_PV: ModelComplete<CustomersResource> = {
  MODEL: {
    name: "Cliente Post Venta",
    plural: "Clientes Post Venta",
    gender: false,
  },
  ICON: "ContactRound",
  ENDPOINT: "/ap/commercial/businessPartners",
  QUERY_KEY: "customers-pv",
  ROUTE: ROUTE_PV,
  ABSOLUTE_ROUTE: ABSOLUTE_ROUTE_PV,
  ROUTE_ADD: `${ABSOLUTE_ROUTE_PV}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE_PV}/actualizar`,
};
