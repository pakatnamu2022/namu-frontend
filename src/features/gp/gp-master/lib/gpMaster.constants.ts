import { ModelComplete } from "@/core/core.interface";
import { GpMastersResource } from "./gpMaster.interface";
import { BadgeColor } from "@/components/ui/badge";

const ROUTE = "maestros-generales";
const ABSOLUTE_ROUTE = `/ap/comercial/${ROUTE}`;

export const GP_MASTERS: ModelComplete<GpMastersResource> = {
  MODEL: {
    name: "Ap Maestro",
    plural: "Ap Maestros",
    gender: true,
  },
  ICON: "Database",
  ENDPOINT: "/gp/gpMasters",
  QUERY_KEY: "apMastersGenerales",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
  EMPTY: {
    id: 0,
    code: "",
    description: "",
    type: "",
    status: true,
  },
};

export const GP_MASTER_TYPE = {
  PAYROLL_LIQUIDATION_BBSS_TYPE: "PAYROLL_LIQUIDATION_BBSS_TYPE",
  PAYROLL_BUNESES: "PAYROLL_BUNESES",
  PAYROLL_LOAN: "PAYROLL_LOAN",
};

export interface GpMasterTypeConfig {
  label: string;
  color: BadgeColor;
}

export const GP_MASTER_TYPE_CONFIG: Record<string, GpMasterTypeConfig> = {
  [GP_MASTER_TYPE.PAYROLL_LIQUIDATION_BBSS_TYPE]: {
    label: "Liquidación BBSS",
    color: "blue",
  },
  [GP_MASTER_TYPE.PAYROLL_BUNESES]: {
    label: "Bonificaciones",
    color: "green",
  },
  [GP_MASTER_TYPE.PAYROLL_LOAN]: {
    label: "Préstamos",
    color: "orange",
  },
};

export const getGpMasterTypeConfig = (type: string): GpMasterTypeConfig =>
  GP_MASTER_TYPE_CONFIG[type] ?? {
    label: type,
    color: "gray",
  };

// CONCEPTOS DE PLANILLA
const ROUTE_PAYROLL_CONCEPTS = "conceptos-planilla";
const ABSOLUTE_ROUTE_PAYROLL_CONCEPTS = `/gp/gestionhumana/planillas/${ROUTE_PAYROLL_CONCEPTS}`;

export const PAYROLL_CONCEPTS: ModelComplete<GpMastersResource> = {
  MODEL: {
    name: "Concepto de Planilla",
    plural: "Conceptos de Planilla",
    gender: false,
  },
  ICON: "Settings",
  ENDPOINT: "/gp/gpMasters",
  QUERY_KEY: "payrollConcepts",
  ROUTE: ROUTE_PAYROLL_CONCEPTS,
  ABSOLUTE_ROUTE: ABSOLUTE_ROUTE_PAYROLL_CONCEPTS,
  ROUTE_ADD: `${ABSOLUTE_ROUTE_PAYROLL_CONCEPTS}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE_PAYROLL_CONCEPTS}/actualizar`,
  EMPTY: {
    id: 0,
    code: "",
    description: "",
    type: "",
    status: true,
  },
};
