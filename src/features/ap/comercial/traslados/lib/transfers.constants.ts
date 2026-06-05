import { type ModelComplete } from "@/core/core.interface";
import { ShipmentsReceptionsResource } from "../../envios-recepciones/lib/shipmentsReceptions.interface";

const ROUTE = "traslados";
const ABSOLUTE_ROUTE = `/ap/comercial/${ROUTE}`;

export const TRANSFERS: ModelComplete<ShipmentsReceptionsResource> = {
  MODEL: {
    name: "Traslado Interno",
    plural: "Traslados Internos",
    gender: true,
  },
  ICON: "Truck",
  ENDPOINT: "/ap/commercial/shippingGuides",
  QUERY_KEY: "internal-transfers",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};
