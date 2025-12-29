import { type ModelComplete } from "@/core/core.interface.ts";
import { PerDiemPolicyResource } from "../../../gp/gestionhumana/viaticos/politica-viaticos/lib/perDiemPolicy.interface";

const ROUTE = "viaticos";
const ABSOLUTE_ROUTE = `/perfil/${ROUTE}`;

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

export const PER_DIEM_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  PAID: "paid",
  PENDING_SETTLEMENT: "pending_settlement",
  IN_PROGRESS: "in_progress",
} as const;
