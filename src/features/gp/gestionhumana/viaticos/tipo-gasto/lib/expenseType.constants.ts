import { ModelComplete } from "@/core/core.interface";



export const EXPENSE_TYPE: ModelComplete = {
  QUERY_KEY: "expense-types",
  ENDPOINT: "/gp/gestion-humana/viaticos/expense-types",
  ABSOLUTE_ROUTE: "/gp/gestion-humana/viaticos/tipo-gasto",
  ICON: "CreditCard",
  ROUTE_ADD: "/gp/gestion-humana/viaticos/tipo-gasto/nuevo",
  ROUTE_UPDATE: "/gp/gestion-humana/viaticos/tipo-gasto/editar",
  ROUTE: "/gp/gestion-humana/viaticos/tipo-gasto",
  MODEL: {
    name: "tipo de gasto",
    gender: false,
  },
};
