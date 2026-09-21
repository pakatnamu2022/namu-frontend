import { type ModelComplete } from "@/core/core.interface";
import { LifePolicyResource } from "./life-policy.interface";

const ROUTE = "polizas-vida-ley";
const ABSOLUTE_ROUTE = `/gp/gestion-humana/planillas/${ROUTE}`;

export const LIFE_POLICY: ModelComplete<LifePolicyResource> = {
  MODEL: {
    name: "Póliza",
    plural: "Pólizas Vida Ley",
    gender: true,
  },
  ICON: "ShieldCheck",
  ENDPOINT: "/gp/gh/payroll/life-insurance-policies",
  QUERY_KEY: "payroll-life-policies",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}`,
};
