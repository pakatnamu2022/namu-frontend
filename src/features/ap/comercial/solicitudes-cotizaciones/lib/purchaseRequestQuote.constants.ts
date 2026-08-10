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

// Tipos de crédito y sus entidades disponibles (F&I Inchcape)
export const CREDIT_TYPE_OPTIONS = [
  { value: "CREDITO_INCHCAPE", label: "Crédito Inchcape" },
  { value: "FONDO_COLECTIVO", label: "Fondo Colectivo" },
  { value: "CAJAS", label: "Cajas" },
  { value: "CREDITO_PROPIO", label: "Crédito Propio" },
  { value: "LEASING", label: "Leasing" },
] as const;

export const CREDIT_ENTITIES_BY_TYPE: Record<string, string[]> = {
  CREDITO_INCHCAPE: ["SANTANDER", "BCP", "BBVA", "BANBIF", "MI BANCO"],
  FONDO_COLECTIVO: [
    "MAQUISISTEMA",
    "MI FONDO",
    "AUTOPLAN",
    "FONBIENES",
    "PANDERO",
    "OPCION",
  ],
  CAJAS: ["CAJA PIURA", "CAJA SULLANA", "CAJA HUANCAYO", "CAJA TRUJILLO"],
  CREDITO_PROPIO: ["INTERBANK", "SCOTIABANK"],
  LEASING: ["BCP", "BBVA", "INTERBANK", "SCOTIABANK"],
};

// Entidades de seguro (siempre "Seguro Inchcape")
export const INSURANCE_ENTITY_OPTIONS = [
  "SANTANDER",
  "LA POSITIVA",
  "MAPFRE",
  "PACIFICO",
  "RIMAC",
  "QUALITAS",
];
