import { ModelComplete } from "@/src/core/core.interface";
import { EstablishmentsResource } from "./establishments.interface";

const ROUTE = "establecimientos";

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
  ROUTE_ADD: `/${ROUTE}/agregar`,
};
