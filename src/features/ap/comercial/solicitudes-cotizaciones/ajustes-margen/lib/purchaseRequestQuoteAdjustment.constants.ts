import { type ModelComplete } from "@/core/core.interface";
import { AdjustmentRequestResource } from "./purchaseRequestQuoteAdjustment.interface";

const ROUTE = "solicitudes-cotizaciones/ajustes-margen";
const ABSOLUTE_ROUTE = `/ap/comercial/${ROUTE}`;

export const PURCHASE_REQUEST_QUOTE_ADJUSTMENT: ModelComplete<AdjustmentRequestResource> =
  {
    MODEL: {
      name: "Ajuste de Margen",
      plural: "Ajustes de Margen",
      gender: false,
    },
    ICON: "PercentCircle",
    ENDPOINT: "/ap/commercial/purchaseRequestQuoteAdjustmentRequest",
    QUERY_KEY: "purchaseRequestQuoteAdjustmentRequest",
    ROUTE,
    ABSOLUTE_ROUTE,
    ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
    ROUTE_UPDATE: `${ABSOLUTE_ROUTE}`,
  };

export const ADJUSTMENT_STATUS_PENDING = "pending";
export const ADJUSTMENT_STATUS_APPROVED = "approved";
export const ADJUSTMENT_STATUS_REJECTED = "rejected";

export const ADJUSTMENT_STATUS_LABEL: Record<string, string> = {
  [ADJUSTMENT_STATUS_PENDING]: "Pendiente",
  [ADJUSTMENT_STATUS_APPROVED]: "Aprobado",
  [ADJUSTMENT_STATUS_REJECTED]: "Rechazado",
};

export const ADJUSTMENT_STATUS_COLOR: Record<
  string,
  "green" | "gray" | "red" | "yellow"
> = {
  [ADJUSTMENT_STATUS_PENDING]: "yellow",
  [ADJUSTMENT_STATUS_APPROVED]: "green",
  [ADJUSTMENT_STATUS_REJECTED]: "red",
};

export const ADJUSTMENT_ACTION_LABEL: Record<string, string> = {
  create: "Agregar",
  update: "Editar",
  delete: "Eliminar",
};
