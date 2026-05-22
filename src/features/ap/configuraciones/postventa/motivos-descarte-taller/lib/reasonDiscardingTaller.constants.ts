import { type ModelComplete } from "@/core/core.interface.ts";
import { AP_MASTERS } from "@/features/ap/ap-master/lib/apMaster.constants.ts";
import { ReasonDiscardingTallerResource } from "./reasonDiscardingTaller.interface";

const ROUTE = "motivos-descarte-taller";
const ABSOLUTE_ROUTE = `/ap/configuraciones/postventa/${ROUTE}`;

export const REASONS_DISCARDING_TALLER: ModelComplete<ReasonDiscardingTallerResource> =
  {
    MODEL: {
      name: "Motivo de Descarte de Repuesto",
      plural: "Motivos de Descarte de Repuesto",
      gender: true,
    },
    ICON: "ContactRound",
    ENDPOINT: AP_MASTERS.ENDPOINT,
    QUERY_KEY: "reasonDiscardingTaller",
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
