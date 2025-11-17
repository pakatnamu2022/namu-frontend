import { type ModelComplete } from "@/core/core.interface";

const ROUTE = "categorias-jerarquicas";

export const HIERARCHICAL_CATEGORY: ModelComplete = {
  MODEL: {
    name: "Categoría Jerárquica",
    plural: "Categorías Jerárquicas",
    gender: true,
  },
  ICON: "ChartBarStacked",
  ENDPOINT: "/gp/gh/performanceEvaluation/hierarchicalCategory",
  QUERY_KEY: "hierarchicalCategory",
  ROUTE,
  ROUTE_ADD: `./agregar`,
  ROUTE_UPDATE: `./actualizar`,
};
