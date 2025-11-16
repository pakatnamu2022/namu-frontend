import { type ModelComplete } from "@/core/core.interface";
import { ClientOriginResource } from "./clientOrigin.interface";
import { COMMERCIAL_MASTERS_ENDPOINT } from "../../../../lib/ap.constants";

const ROUTE = "origen-cliente";

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
  EMPTY: {
    id: 0,
    description: "",
    type: "",
    status: true,
  },
};
