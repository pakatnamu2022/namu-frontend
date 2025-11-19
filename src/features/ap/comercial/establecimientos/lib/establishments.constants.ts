import { type ModelComplete } from "@/core/core.interface";
import { EstablishmentsResource } from "./establishments.interface";
import { CUSTOMERS } from "../../clientes/lib/customers.constants";

const { ABSOLUTE_ROUTE: CUSTOMER_ABSOLUTE_ROUTE } = CUSTOMERS;
const ROUTE = "establecimientos";
const ABSOLUTE_ROUTE = `${CUSTOMER_ABSOLUTE_ROUTE}/${ROUTE}`;

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
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/editar`,
};
