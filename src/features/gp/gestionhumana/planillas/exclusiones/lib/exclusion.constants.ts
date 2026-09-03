import { type ModelComplete, type Option } from "@/core/core.interface";
import { ExclusionResource } from "./exclusion.interface";

const ROUTE = "exclusiones";
const ABSOLUTE_ROUTE = `/gp/gestion-humana/planillas/${ROUTE}`;

export const PAYROLL_EXCLUSION: ModelComplete<ExclusionResource> = {
  MODEL: {
    name: "Exclusión",
    plural: "Exclusiones",
    gender: true,
  },
  ICON: "ShieldOff",
  ENDPOINT: "/gp/gh/payroll/exclusions",
  QUERY_KEY: "payroll-exclusions",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}`,
};

// Debe reflejar App\Models\gp\gestionhumana\payroll\PayrollExclusion::CONCEPTS —
// agregar aquí cuando se generalice a otros conceptos (gratificación, CTS, etc.).
export const EXCLUSION_CONCEPTS: Option[] = [
  { value: "FAMILY_ALLOWANCE", label: "Asignación Familiar" },
];
