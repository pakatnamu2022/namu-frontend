import { type ModelComplete } from "@/core/core.interface";
import { ControlUnitsResource } from "./controlUnits.interface";

const ROUTE = "control-unidades";
const ABSOLUTE_ROUTE = `/ap/comercial/${ROUTE}`;

export const CONTROL_UNITS: ModelComplete<ControlUnitsResource> = {
  MODEL: {
    name: "Control de Unidades",
    plural: "Controles de Unidades",
    gender: true,
  },
  ICON: "TowerControl",
  ENDPOINT: "/ap/commercial/shippingGuides",
  QUERY_KEY: "control-units",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};

export const CONTROL_UNITS_ROUTE_ADD_CONSIGNMENT = `${ABSOLUTE_ROUTE}/consignacion/agregar`;

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
