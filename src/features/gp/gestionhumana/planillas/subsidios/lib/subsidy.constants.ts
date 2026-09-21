import { type ModelComplete, type Option } from "@/core/core.interface";
import { SubsidyResource } from "./subsidy.interface";

const ROUTE = "subsidios";
const ABSOLUTE_ROUTE = `/gp/gestion-humana/planillas/${ROUTE}`;

export const SUBSIDY: ModelComplete<SubsidyResource> = {
  MODEL: {
    name: "Subsidio",
    plural: "Subsidios",
    gender: false,
  },
  ICON: "HeartPulse",
  ENDPOINT: "/gp/gh/payroll/subsidies",
  QUERY_KEY: "payroll-subsidies",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}`,
};

// Debe reflejar App\Models\gp\gestionhumana\payroll\PayrollSubsidy::TYPES
export const SUBSIDY_TYPES: Option[] = [
  { value: "INCAPACIDAD_TEMPORAL", label: "Incapacidad temporal" },
  { value: "MATERNIDAD", label: "Maternidad" },
];
