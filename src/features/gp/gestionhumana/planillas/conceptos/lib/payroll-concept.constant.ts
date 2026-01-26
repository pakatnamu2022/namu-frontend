import { type ModelComplete } from "@/core/core.interface";

const ROUTE = "conceptos";
const ABSOLUTE_ROUTE = `/gp/gestion-humana/planillas/${ROUTE}`;

export const PAYROLL_CONCEPT: ModelComplete = {
  MODEL: {
    name: "Concepto de Planilla",
    plural: "Conceptos de Planilla",
    gender: false,
  },
  ICON: "Calculator",
  ENDPOINT: "/gp/gh/payroll/concepts",
  QUERY_KEY: "payroll-concepts",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};

export const PAYROLL_CONCEPT_TYPE_OPTIONS = [
  { value: "EARNING", label: "Ingreso" },
  { value: "DEDUCTION", label: "Descuento" },
  { value: "CONTRIBUTION", label: "Aportación" },
];

export const PAYROLL_CONCEPT_CATEGORY_OPTIONS = [
  { value: "BASE_SALARY", label: "Salario Base" },
  { value: "BONUS", label: "Bonificación" },
  { value: "OVERTIME", label: "Horas Extra" },
  { value: "ALLOWANCE", label: "Asignación" },
  { value: "COMMISSION", label: "Comisión" },
  { value: "TAX", label: "Impuesto" },
  { value: "SOCIAL_SECURITY", label: "Seguro Social" },
  { value: "PENSION", label: "Pensión" },
  { value: "LOAN", label: "Préstamo" },
  { value: "OTHER", label: "Otro" },
];
