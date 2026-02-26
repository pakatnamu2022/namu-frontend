import { type ModelComplete } from "@/core/core.interface";
import { ControlUnitsResource } from "./controlUnits.interface";

const ROUTE = "vehiculos-consignacion";
const ABSOLUTE_ROUTE = `/ap/comercial/${ROUTE}`;

export const CONTROL_UNITS: ModelComplete<ControlUnitsResource> & {
  CHECKLIST_ROUTE: string;
} = {
  MODEL: {
    name: "Vehículo Consignación",
    plural: "Vehículos Consignación",
    gender: false,
  },
  ICON: "TowerControl",
  ENDPOINT: "/ap/commercial/shippingGuides",
  QUERY_KEY: "consignation-vehicles",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
  CHECKLIST_ROUTE: `${ABSOLUTE_ROUTE}/checklist/:id`,
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
