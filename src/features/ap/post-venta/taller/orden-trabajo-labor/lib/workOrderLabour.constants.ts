import { type ModelComplete } from "@/core/core.interface.ts";
import { type BadgeColor } from "@/components/ui/badge";
import { WorkOrderLabourResource } from "./workOrderLabour.interface";

const ROUTE = "orden-trabajo";
const ABSOLUTE_ROUTE = `/ap/post-venta/taller/${ROUTE}`;

export const LABOUR_TYPE_LABOR = "labor";
export const LABOUR_TYPE_MATERIAL = "material";
export const LABOUR_TYPE_DEDUCTIBLE = "deductible";

export const DESCRIPTION_MATERIALES = "Materiales";
export const DESCRIPTION_DEDUCTIBLE_KEYWORD = "DEDUCIBLE";

export const LABOUR_TYPE_OPTIONS = [
  { label: "Mano de Obra", value: LABOUR_TYPE_LABOR },
  { label: "Materiales", value: LABOUR_TYPE_MATERIAL },
  { label: "Deducible", value: LABOUR_TYPE_DEDUCTIBLE },
];

export const LABOUR_TYPE_TRANSLATOR: Record<
  string,
  { label: string; color: BadgeColor }
> = {
  [LABOUR_TYPE_LABOR]: { label: "Mano de Obra", color: "blue" },
  [LABOUR_TYPE_MATERIAL]: { label: "Materiales", color: "orange" },
  [LABOUR_TYPE_DEDUCTIBLE]: { label: "Deducible", color: "yellow" },
};

export const WORKER_ORDER_LABOUR: ModelComplete<WorkOrderLabourResource> = {
  MODEL: {
    name: "Labor de Orden de Trabajo",
    plural: "Labores de Orden de Trabajo",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/ap/postVenta/workOrderLabour",
  QUERY_KEY: "workOrderLabour",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};
