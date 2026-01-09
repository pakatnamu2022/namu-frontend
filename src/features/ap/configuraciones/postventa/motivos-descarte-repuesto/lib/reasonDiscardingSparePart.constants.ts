import { type ModelComplete } from "@/core/core.interface.ts";
import { AP_MASTERS } from "@/features/ap/ap-master/lib/apMaster.constants.ts";
import { ReasonDiscardingSparePartResource } from "./reasonDiscardingSparePart.interface";

const ROUTE = "motivos-descarte-repuesto";
const ABSOLUTE_ROUTE = `/ap/configuraciones/postventa/${ROUTE}`;

export const REASONS_DISCARDING_SPAREPART: ModelComplete<ReasonDiscardingSparePartResource> =
  {
    MODEL: {
      name: "Motivo de Descarte de Repuesto",
      plural: "Motivos de Descarte de Repuesto",
      gender: true,
    },
    ICON: "ContactRound",
    ENDPOINT: AP_MASTERS.ENDPOINT,
    QUERY_KEY: "reasonDiscardingSparePart",
    ROUTE,
    ABSOLUTE_ROUTE,
    ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
    ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/editar`,
    EMPTY: {
      id: 0,
      code: "",
      description: "",
      type: "",
      status: true,
    },
  };
