import { type ModelComplete } from "@/core/core.interface.ts";
import { ConceptObjectivePeriodPvResource } from "./conceptObjectivePeriodPv.interface.ts";
import {
  AREA_MESON,
  AREA_TALLER,
} from "@/features/ap/ap-master/lib/apMaster.constants.ts";

const ROUTE = "objetivos-taller-meson";
const ABSOLUTE_ROUTE = `/ap/configuraciones/postventa/${ROUTE}`;

export const CONCEPT_OBJECTIVE_PERIOD_PV: ModelComplete<ConceptObjectivePeriodPvResource> =
  {
    MODEL: {
      name: "Concepto de Objetivo",
      plural: "Conceptos de Objetivo del Período",
      gender: true,
    },
    ICON: "Target",
    ENDPOINT: "/ap/postVenta/conceptObjectivePeriodPv",
    QUERY_KEY: "conceptObjectivePeriodPv",
    ROUTE,
    ABSOLUTE_ROUTE,
    ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
    ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/editar`,
    EMPTY: {
      id: 0,
      objective_sede_period_pv_id: 0,
      objective_sede_period: null,
      area_id: 0,
      area: null,
      description: "",
      is_vehicular_crossing: false,
      status: true,
      sub_amount: "0.00",
      order: 0,
      type_planning_ids: [],
      advisors: [],
      created_at: "",
      updated_at: "",
    },
  };

export const CONCEPT_OBJECTIVE_PERIOD_PV_AREA_OPTIONS = [
  { value: AREA_TALLER.toString(), label: "Taller" },
  { value: AREA_MESON.toString(), label: "Mesón" },
];

export { AREA_TALLER, AREA_MESON };
