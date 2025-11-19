import { type ModelComplete } from "@/core/core.interface";
import { EstablishmentsResource } from "./establishments.interface";
import { CUSTOMERS } from "../../clientes/lib/customers.constants";
import { SUPPLIERS } from "../../proveedores/lib/suppliers.constants";

const { ABSOLUTE_ROUTE: CUSTOMER_ABSOLUTE_ROUTE } = CUSTOMERS;
const { ABSOLUTE_ROUTE: SUPPLIERS_ABSOLUTE_ROUTE } = SUPPLIERS;
const ROUTE = "establecimientos";
const ABSOLUTE_ROUTE = `${CUSTOMER_ABSOLUTE_ROUTE}/${ROUTE}`;
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
