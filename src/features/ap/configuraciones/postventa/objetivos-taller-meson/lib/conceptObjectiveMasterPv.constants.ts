import { type ModelComplete } from "@/core/core.interface.ts";
import { ConceptObjectivePvResource } from "./conceptObjectiveMasterPv.interface.ts";
import {
  AREA_MESON,
  AREA_TALLER,
} from "@/features/ap/ap-master/lib/apMaster.constants.ts";

const ROUTE = "objetivos-taller-meson";
const ABSOLUTE_ROUTE = `/ap/configuraciones/post-venta/${ROUTE}`;

export const CONCEPT_OBJECTIVE_PV: ModelComplete<ConceptObjectivePvResource> = {
  MODEL: {
    name: "Objetivo",
    plural: "Objetivos de Taller y Mesón",
    gender: true,
  },
  ICON: "Target",
  ENDPOINT: "/ap/postVenta/conceptObjectiveMasterPv",
  QUERY_KEY: "conceptObjectivePv",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/editar`,
  EMPTY: {
    id: 0,
    area_id: 0,
    area: null,
    description: "",
    is_vehicular_crossing: false,
    status: true,
    type_planning_ids: [],
    order: 0,
    created_at: "",
    updated_at: "",
  },
};

export const CONCEPT_OBJECTIVE_PV_AREA_OPTIONS = [
  { value: AREA_TALLER.toString(), label: "Taller" },
  { value: AREA_MESON.toString(), label: "Mesón" },
];

export { AREA_TALLER, AREA_MESON };
