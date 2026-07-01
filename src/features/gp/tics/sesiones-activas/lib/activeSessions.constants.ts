import { type ModelComplete } from "@/core/core.interface";
import { ActiveSessionUser } from "./activeSessions.interface";

const ROUTE = "sesiones-activas";
const ABSOLUTE_ROUTE = "/gp/tics/sesiones-activas";

export const ACTIVE_SESSIONS: ModelComplete<ActiveSessionUser> = {
  MODEL: {
    name: "Sesión Activa",
    plural: "Sesiones Activas",
    gender: true,
  },
  ICON: "Wifi",
  ENDPOINT: "/active-sessions",
  QUERY_KEY: "activeSessions",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: ABSOLUTE_ROUTE,
  ROUTE_UPDATE: ABSOLUTE_ROUTE,
  EMPTY: {
    user_id: 0,
    username: "",
    name: "",
    cargo: null,
    sede: null,
    empresa: null,
    login_at: null,
    last_seen_at: null,
    active_minutes: 0,
    session_count: 0,
    status: "inactive",
  },
};
