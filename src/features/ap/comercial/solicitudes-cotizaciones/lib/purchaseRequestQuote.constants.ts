import { type ModelComplete } from "@/core/core.interface";
import { PurchaseRequestQuoteResource } from "./purchaseRequestQuote.interface";

const ROUTE = "solicitudes-cotizaciones";

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
    ROUTE_ADD: `./agregar`,
    ROUTE_UPDATE: `./actualizar`,
  };
