import { type ModelComplete } from "@/core/core.interface.ts";
import { PerDiemPolicyResource } from "../../politica-viaticos/lib/perDiemPolicy.interface";

const ROUTE = "soolicitud-viaticos";
const ABSOLUTE_ROUTE = `/gp/gestion-humana/viaticos/${ROUTE}`;

export const PER_DIEM_REQUEST: ModelComplete<PerDiemPolicyResource> = {
  MODEL: {
    name: "Solicitud de Viáticos",
    plural: "Solicitudes de Viáticos",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "gp/gestion-humana/viaticos/per-diem-requests",
  QUERY_KEY: "perDiemRequests",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};
