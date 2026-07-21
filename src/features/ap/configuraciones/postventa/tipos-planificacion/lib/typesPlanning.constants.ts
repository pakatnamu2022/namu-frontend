import { type ModelComplete } from "@/core/core.interface.ts";
import { TypesPlanningResource } from "./typesPlanning.interface.ts";

const ROUTE = "tipos-planificacion";
const ABSOLUTE_ROUTE = `/ap/configuraciones/postventa/${ROUTE}`;

export const INTERNA_SC = "INTERNA_SC";
export const INTERNA_CC = "INTERNA_CC";
export const PAYMENT_RECEIPTS = "PAYMENT_RECEIPTS";

export const TYPES_DOCUMENT = [
  { value: INTERNA_CC, label: "INTERNA CON COMPROBANTE" },
  { value: INTERNA_SC, label: "INTERNA SIN COMPROBANTE" },
  { value: PAYMENT_RECEIPTS, label: "COMPROBANTE DE PAGO" },
];

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
