import { type ModelComplete } from "@/core/core.interface.ts";
import { ObjectiveSedePeriodPvResource } from "./objectiveSedePeriodPv.interface.ts";

const ROUTE = "objetivos-taller-meson";
const ABSOLUTE_ROUTE = `/ap/configuraciones/postventa/${ROUTE}`;

export const OBJECTIVE_SEDE_PERIOD_PV: ModelComplete<ObjectiveSedePeriodPvResource> =
  {
    MODEL: {
      name: "Objetivo de Sede",
      plural: "Objetivos por Sede y Período",
      gender: true,
    },
    ICON: "Target",
    ENDPOINT: "/ap/postVenta/objectiveSedePeriodPv",
    QUERY_KEY: "objectiveSedePeriodPv",
    ROUTE,
    ABSOLUTE_ROUTE,
    ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
    ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/editar`,
    EMPTY: {
      id: 0,
      sede_id: 0,
      sede: null,
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      amount: "0.00",
      created_at: "",
      updated_at: "",
    },
  };
