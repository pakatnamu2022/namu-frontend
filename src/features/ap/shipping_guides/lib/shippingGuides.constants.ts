import { ModelComplete } from "@/core/core.interface";
import { ShippingGuidesResource } from "./shippingGuides.interface";

const ROUTE = "envios-recepciones";
const ABSOLUTE_ROUTE = `/ap/comercial/${ROUTE}`;

export const SHIPPING_GUIDES: ModelComplete<ShippingGuidesResource> = {
  MODEL: {
    name: "Guía de Remisión",
    plural: "Guías de Remisión y Traslado",
    gender: true,
  },
  ICON: "Package",
  ENDPOINT: "/ap/commercial/shippingGuides",
  QUERY_KEY: "shipments-receptions",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};

// Tipos de documento
export const DOCUMENT_TYPES = [
  { value: "GUIA_REMISION", label: "Guía de Remisión" },
  { value: "GUIA_TRASLADO", label: "Guía Interna de Traslado" },
];

// Tipos de emisor
export const ISSUER_TYPES = [
  { value: "SYSTEM", label: "Automotores" },
  { value: "PROVEEDOR", label: "Proveedor" },
];
