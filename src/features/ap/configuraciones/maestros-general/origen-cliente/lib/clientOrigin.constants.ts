import { type ModelComplete } from "@/core/core.interface";
import { ClientOriginResource } from "./clientOrigin.interface";
import { COMMERCIAL_MASTERS_ENDPOINT } from "../../../../lib/ap.constants";

const ROUTE = "origen-cliente";
const ABSOLUTE_ROUTE = `/ap/configuraciones/maestros-general/${ROUTE}`;

export const CLIENT_ORIGIN: ModelComplete<ClientOriginResource> = {
  MODEL: {
    name: "Origen Cliente",
    plural: "Origenes Cliente",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: COMMERCIAL_MASTERS_ENDPOINT,
  QUERY_KEY: "clientOrigin",
  ROUTE,
  ABSOLUTE_ROUTE,
  EMPTY: {
    id: 0,
    description: "",
    type: "",
    status: true,
  },
};
