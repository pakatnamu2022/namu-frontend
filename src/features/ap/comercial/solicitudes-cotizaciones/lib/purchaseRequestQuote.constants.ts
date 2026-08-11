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

// Tipos de crédito, entidades de crédito y entidades de seguro ahora se
// obtienen desde /api/ap/apMasters (tipos CREDIT_TYPE, CREDIT_ENTITY e
// INSURANCE_ENTITY, filtrando entidades por parent_id). Ver useCreditTypes /
// useCreditEntities / useAllCreditEntities / useInsuranceEntities en
// purchaseRequestQuote.hook.ts, consumidos desde CreditInsuranceGpsSection
// y desde la página de listado (para las etiquetas de la tabla).
