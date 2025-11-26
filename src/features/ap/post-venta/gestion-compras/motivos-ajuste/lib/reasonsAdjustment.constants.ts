import { type ModelComplete } from "@/core/core.interface";
import { POSTVENTA_MASTERS_ENDPOINT } from "@/features/ap/lib/ap.constants";
import { ReasonsAdjustmentResource } from "./reasonsAdjustment.interface";

const ROUTE = "motivos-ajuste";
const ABSOLUTE_ROUTE = `/ap/post-venta/gestion-compras/${ROUTE}`;

export const REASONS_ADJUSTMENT: ModelComplete<ReasonsAdjustmentResource> = {
  MODEL: {
    name: "Motivo de Ajuste",
    plural: "Motivos de Ajuste",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: POSTVENTA_MASTERS_ENDPOINT,
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
