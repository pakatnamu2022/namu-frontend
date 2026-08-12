import { type ModelComplete, type Option } from "@/core/core.interface";
import { PlansResource } from "./plans.interface";

const ROUTE = "planes";
const ABSOLUTE_ROUTE = `/ap/comercial/marketing/${ROUTE}`;

export const PLANS: ModelComplete<PlansResource> = {
  MODEL: {
    name: "Plan de Marketing",
    plural: "Planes de Marketing",
    gender: false,
  },
  ICON: "NotebookPen",
  ENDPOINT: "/marketing/plans",
  QUERY_KEY: "marketing-plans",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};

export const PLAN_STATUS_OPTIONS: Option[] = [
  { label: "Borrador", value: "draft" },
  { label: "Activo", value: "active" },
  { label: "Cerrado", value: "closed" },
  { label: "Cancelado", value: "cancelled" },
];
