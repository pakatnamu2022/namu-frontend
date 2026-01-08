import { type ModelComplete } from "@/core/core.interface";
import { CategoryChecklistResource } from "./categoryChecklist.interface";
import { AP_MASTERS } from "@/features/ap/comercial/ap-master/lib/apMaster.constants";

const ROUTE = "categorias-checklist";
const ABSOLUTE_ROUTE = `/ap/configuraciones/vehiculos/${ROUTE}`;

export const CATEGORY_CHECKLIST: ModelComplete<CategoryChecklistResource> = {
  MODEL: {
    name: "Categoria checklist",
    plural: "Categorias checklist",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: AP_MASTERS.ENDPOINT,
  QUERY_KEY: "categoryChecklist",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
  EMPTY: { id: 0, description: "", type: "", status: true },
};
