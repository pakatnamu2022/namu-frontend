import { type ModelComplete, type Option } from "@/core/core.interface";
import { ProposalsResource } from "./proposals.interface";

const ROUTE = "propuestas";
const ABSOLUTE_ROUTE = `/ap/marketing/${ROUTE}`;

export const PROPOSALS: ModelComplete<ProposalsResource> = {
  MODEL: {
    name: "Propuesta de Proveedor",
    plural: "Propuestas de Proveedor",
    gender: true,
  },
  ICON: "FileCheck2",
  ENDPOINT: "/ap/marketing/proposals",
  QUERY_KEY: "marketing-proposals",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};

export const PROPOSAL_STATUS_OPTIONS: Option[] = [
  { label: "Pendiente", value: "pending" },
  { label: "Aprobada", value: "approved" },
  { label: "Rechazada", value: "rejected" },
];
