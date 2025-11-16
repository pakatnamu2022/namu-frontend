import { ModelComplete } from "@/src/core/core.interface";
import { CategoryChecklistResource } from "./categoryChecklist.interface";
import { COMMERCIAL_MASTERS_ENDPOINT } from "@/src/features/ap/lib/ap.constants";

const ROUTE = "categorias-checklist";

export const CATEGORY_CHECKLIST: ModelComplete<CategoryChecklistResource> = {
  MODEL: {
    name: "Categoria checklist",
    plural: "Categorias checklist",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: COMMERCIAL_MASTERS_ENDPOINT,
  QUERY_KEY: "categoryChecklist",
  ROUTE,
  EMPTY: { id: 0, description: "", type: "", status: true },
};
