import { type ModelComplete } from "@/core/core.interface";
import { PurchaseRequestQuoteResource } from "./purchaseRequestQuote.interface";

const ROUTE = "solicitudes-cotizaciones";
const ABSOLUTE_ROUTE = `/ap/comercial/${ROUTE}`;

export const PURCHASE_REQUEST_QUOTE: ModelComplete<PurchaseRequestQuoteResource> =
  {
    MODEL: {
      name: "Solicitud / Cotización",
      plural: "Solicitudes / Cotizaciones",
      gender: true,
    },
    ICON: "ContactRound",
    ENDPOINT: "/ap/commercial/purchaseRequestQuote",
    QUERY_KEY: "purchaseRequestQuote",
    ROUTE,
    ABSOLUTE_ROUTE,
    // La ruta de actualizar ahora requiere el opportunity_id como parámetro
    ROUTE_ADD: `${ABSOLUTE_ROUTE}/:opportunity_id/agregar`,
    ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
  };
