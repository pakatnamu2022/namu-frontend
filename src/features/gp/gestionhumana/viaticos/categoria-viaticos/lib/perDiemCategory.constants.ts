import { type ModelComplete } from "@/core/core.interface.ts";
import { PerDiemCategoryResource } from "./perDiemCategory.interface";

const ROUTE = "categoria-viaticos";
const ABSOLUTE_ROUTE = `/gp/gestion-humana/viaticos/${ROUTE}`;

export const PER_DIEM_CATEGORY: ModelComplete<PerDiemCategoryResource> = {
  MODEL: {
    name: "Categoria de Viatico",
    plural: "Categorias de Viaticos",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/gp/gestion-humana/viaticos/perDiemCategory",
  QUERY_KEY: "perDiemCategory",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};
