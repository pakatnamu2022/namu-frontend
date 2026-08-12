import { type ModelComplete, type Option } from "@/core/core.interface";
import { BudgetsResource } from "./budgets.interface";

const ROUTE = "presupuestos";
const ABSOLUTE_ROUTE = `/ap/comercial/marketing/${ROUTE}`;

export const BUDGETS: ModelComplete<BudgetsResource> = {
  MODEL: {
    name: "Presupuesto",
    plural: "Presupuestos",
    gender: true,
  },
  ICON: "Wallet",
  ENDPOINT: "/marketing/budgets",
  QUERY_KEY: "marketing-budgets",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};

export const BUDGET_TYPE_OPTIONS: Option[] = [
  { label: "Regular", value: "regular" },
  { label: "Adicional", value: "additional" },
];

export const BUDGET_STATUS_OPTIONS: Option[] = [
  { label: "Borrador", value: "draft" },
  { label: "Aprobado", value: "approved" },
  { label: "Cerrado", value: "closed" },
];

export const FUNDING_SOURCE_OPTIONS: Option[] = [
  { label: "AP", value: "AP" },
  { label: "Marca", value: "brand" },
];
