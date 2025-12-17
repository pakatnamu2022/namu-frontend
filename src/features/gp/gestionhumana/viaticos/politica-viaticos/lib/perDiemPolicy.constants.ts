import { type ModelComplete } from "@/core/core.interface.ts";
import { PerDiemPolicyResource } from "./perDiemPolicy.interface";

const ROUTE = "politica-viaticos";
const ABSOLUTE_ROUTE = `/gp/gestion-humana/viaticos/${ROUTE}`;

export const PER_DIEM_POLICY: ModelComplete<PerDiemPolicyResource> = {
  MODEL: {
    name: "Politica de Viatico",
    plural: "Politicas de Viaticos",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "gp/gestion-humana/viaticos/perDiemPolicy",
  QUERY_KEY: "perDiemPolicy",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};
