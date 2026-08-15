import { type ModelComplete } from "@/core/core.interface.ts";
import { TypesPlanningResource } from "./typesPlanning.interface.ts";

const ROUTE = "tipos-planificacion";
const ABSOLUTE_ROUTE = `/ap/configuraciones/post-venta/${ROUTE}`;

export const INTERNA_SC = "INTERNA_SC";
export const INTERNA_CC = "INTERNA_CC";
export const PAYMENT_RECEIPTS = "PAYMENT_RECEIPTS";

export const ESTANDAR = "ESTANDAR";
export const INTERNA = "INTERNA";
export const GARANTIA_RECALL = "GARANTIA_RECALL";

export const TYPES_DOCUMENT = [
  { value: INTERNA_CC, label: "INTERNA CON COMPROBANTE" },
  { value: INTERNA_SC, label: "INTERNA SIN COMPROBANTE" },
  { value: PAYMENT_RECEIPTS, label: "COMPROBANTE DE PAGO" },
];

export const CATEGORY_TYPE = [
  { value: ESTANDAR, label: "ESTANDAR" },
  { value: INTERNA, label: "INTERNA" },
  { value: GARANTIA_RECALL, label: "GARANTIA / RECALL" },
];

export const TYPE_DOCUMENT_LABELS: Record<string, string> = Object.fromEntries(
  TYPES_DOCUMENT.map(({ value, label }) => [value, label]),
);

export const CATEGORY_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORY_TYPE.map(({ value, label }) => [value, label]),
);

export const TYPE_PLANNING: ModelComplete<TypesPlanningResource> = {
  MODEL: {
    name: "Tipo de Planificación",
    plural: "Tipos de Planificación",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/ap/postVenta/typePlanningWorkOrder",
  QUERY_KEY: "typesPlanning",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
  EMPTY: {
    id: 0,
    code: "",
    description: "",
    notes: "",
    validate_receipt: false,
    validate_labor: false,
    type_document: PAYMENT_RECEIPTS,
    category_type: ESTANDAR,
    status: true,
  },
};

export const INTERNAL_WORKSHOP_ID = 7;
export const DERCO_WARRANTY_ID = 9;
export const ODEBRECHT_MAINTENANCE_ID = 13;
export const INTERNAL_VN_ID = 8;
export const DIAGNOSIS_ID = 2;
export const SERVICE_PDI_ID = 6;

export const OT_UNBILLED_IDS = [
  INTERNAL_WORKSHOP_ID,
  INTERNAL_VN_ID,
  DIAGNOSIS_ID,
];
