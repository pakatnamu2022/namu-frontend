import { type ModelComplete } from "@/core/core.interface.ts";

const ROUTE = "gastos";

export const PER_DIEM_EXPENSE: ModelComplete<any> = {
  MODEL: {
    name: "Gasto",
    plural: "Gastos",
    gender: false,
  },
  ICON: "Receipt",
  ENDPOINT: "gp/gestion-humana/viaticos/per-diem-expenses",
  QUERY_KEY: "perDiemExpenses",
  ROUTE,
  ABSOLUTE_ROUTE: `/profile/viaticos/${ROUTE}`,
  ROUTE_ADD: `/profile/viaticos/${ROUTE}/add`,
  ROUTE_UPDATE: `/profile/viaticos/${ROUTE}/update`,
};

export const TYPE_EXPENSE_LOCAL_MOBILITY = "7";
