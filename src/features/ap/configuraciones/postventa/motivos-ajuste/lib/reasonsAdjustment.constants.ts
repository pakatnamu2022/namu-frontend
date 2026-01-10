import { type ModelComplete } from "@/core/core.interface.ts";
import { ReasonsAdjustmentResource } from "./reasonsAdjustment.interface.ts";
import { AP_MASTERS } from "@/features/ap/ap-master/lib/apMaster.constants.ts";

const ROUTE = "motivos-ajuste";
const ABSOLUTE_ROUTE = `/ap/configuraciones/postventa/${ROUTE}`;

export const REASONS_ADJUSTMENT: ModelComplete<ReasonsAdjustmentResource> = {
  MODEL: {
    name: "Motivo de Ajuste",
    plural: "Motivos de Ajuste",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: AP_MASTERS.ENDPOINT,
  QUERY_KEY: "reasonsAdjustment",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/editar`,
  EMPTY: {
    id: 0,
    code: "",
    description: "",
    type: "",
    status: true,
  },
};

export const OBSERVATION_REASONS = [
  { value: "DAMAGED", label: "Dañado" },
  { value: "DEFECTIVE", label: "Defectuoso" },
  { value: "EXPIRED", label: "Vencido" },
  { value: "WRONG_PRODUCT", label: "Producto Incorrecto" },
  { value: "WRONG_QUANTITY", label: "Cantidad Incorrecta" },
  { value: "POOR_QUALITY", label: "Mala Calidad" },
  { value: "OTHER", label: "Otro" },
] as const;
