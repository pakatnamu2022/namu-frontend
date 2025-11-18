import { type ModelComplete } from "@/core/core.interface";
import { EstablishmentsResource } from "./establishments.interface";

const ROUTE = "establecimientos";
const ABSOLUTE_ROUTE = `/ap/comercial/${ROUTE}`;

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
