import { ModelComplete } from "@/core/core.interface";
import { ShipmentsReceptionsResource } from "./shipmentsReceptions.interface";

const ROUTE = "envios-recepciones";

export const SHIPMENTS_RECEPTIONS: ModelComplete<ShipmentsReceptionsResource> =
  {
    MODEL: {
      name: "Guía de Remisión",
      plural: "Guías de Remisión y Traslado",
      gender: true,
    },
    ICON: "FileText",
    ENDPOINT: "/ap/commercial/shippingGuides",
    QUERY_KEY: "shipments-receptions",
    ROUTE,
    ROUTE_ADD: `${ROUTE}/agregar`,
    ROUTE_UPDATE: `${ROUTE}/actualizar`,
  };

// Tipos de documento
export const DOCUMENT_TYPES = [
  { value: "GUIA_REMISION", label: "Guía de Remisión" },
  { value: "GUIA_TRASLADO", label: "Guía Interna de Traslado" },
];

// Tipos de emisor
export const ISSUER_TYPES = [
  { value: "NOSOTROS", label: "Automotores" },
  { value: "PROVEEDOR", label: "Proveedor" },
];
