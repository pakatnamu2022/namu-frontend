import { type ModelComplete } from "@/core/core.interface.ts";

const ROUTE = "gastos";

export const PER_DIEM_EXPENSE: Partial<ModelComplete<any>> = {
  MODEL: {
    name: "Gasto",
    plural: "Gastos",
    gender: false,
  },
  ICON: "Receipt",
  ENDPOINT: "gp/gestion-humana/viaticos/per-diem-expenses",
  QUERY_KEY: "perDiemExpenses",
  ROUTE,
};
