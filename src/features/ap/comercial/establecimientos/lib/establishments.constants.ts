import { type ModelComplete } from "@/core/core.interface";
import { EstablishmentsResource } from "./establishments.interface";
import {
  CUSTOMERS,
  CUSTOMERS_PV,
} from "../../clientes/lib/customers.constants";
import { SUPPLIERS } from "../../proveedores/lib/suppliers.constants";

const { ABSOLUTE_ROUTE: CUSTOMER_ABSOLUTE_ROUTE } = CUSTOMERS;
const { ABSOLUTE_ROUTE: CUSTOMER_ABSOLUTE_ROUTE_PV } = CUSTOMERS_PV; //PARA POST-VENTA
const { ABSOLUTE_ROUTE: SUPPLIERS_ABSOLUTE_ROUTE } = SUPPLIERS;
const ROUTE = "establecimientos";
const ABSOLUTE_ROUTE = `${CUSTOMER_ABSOLUTE_ROUTE}/${ROUTE}`;
const ABSOLUTE_ROUTE_PV = `${CUSTOMER_ABSOLUTE_ROUTE_PV}/${ROUTE}`; //PARA POST-VENTA
const SUPPLIER_ABSOLUTE_ROUTE = `${SUPPLIERS_ABSOLUTE_ROUTE}/${ROUTE}`;

export const ESTABLISHMENTS: ModelComplete<EstablishmentsResource> = {
  MODEL: {
    name: "Establecimiento",
    plural: "Establecimientos",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/ap/commercial/businessPartnersEstablishments",
  QUERY_KEY: "establishments",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};

export const SUPPLIER_ESTABLISHMENTS: ModelComplete<EstablishmentsResource> = {
  MODEL: {
    name: "Establecimiento",
    plural: "Establecimientos",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/ap/commercial/businessPartnersEstablishments",
  QUERY_KEY: "establishments",
  ROUTE,
  ABSOLUTE_ROUTE: SUPPLIER_ABSOLUTE_ROUTE,
  ROUTE_ADD: `${SUPPLIER_ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${SUPPLIER_ABSOLUTE_ROUTE}/actualizar`,
};

export const ESTABLISHMENTS_PV: ModelComplete<EstablishmentsResource> = {
  MODEL: {
    name: "Establecimiento",
    plural: "Establecimientos",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/ap/commercial/businessPartnersEstablishments",
  QUERY_KEY: "establishments",
  ROUTE,
  ABSOLUTE_ROUTE: ABSOLUTE_ROUTE_PV,
  ROUTE_ADD: `${ABSOLUTE_ROUTE_PV}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE_PV}/actualizar`,
};
