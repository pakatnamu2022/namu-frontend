import { type ModelComplete } from "@/core/core.interface";
import { ShipmentsReceptionsResource } from "./shipmentsReceptions.interface";

const ROUTE = "control-unidades";
const ABSOLUTE_ROUTE = `/ap/comercial/${ROUTE}`;
const ROUTE_UNIT_CONTROL = "control-unidades";
const ABSOLUTE_ROUTE_UNIT_CONTROL = `/ap/comercial/${ROUTE_UNIT_CONTROL}`;

export const SHIPMENTS_RECEPTIONS: ModelComplete<ShipmentsReceptionsResource> =
  {
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

export const UNIT_CONTROL: ModelComplete<ShipmentsReceptionsResource> = {
  MODEL: {
    name: "Control de Unidades",
    plural: "Controles de Unidades",
    gender: true,
  },
  ICON: "TowerControl",
  ENDPOINT: "/ap/commercial/shippingGuides",
  QUERY_KEY: "unit-control",
  ROUTE,
  ABSOLUTE_ROUTE: ABSOLUTE_ROUTE_UNIT_CONTROL,
  ROUTE_ADD: `${ABSOLUTE_ROUTE_UNIT_CONTROL}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE_UNIT_CONTROL}/actualizar`,
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
