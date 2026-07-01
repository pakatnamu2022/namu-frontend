import { api } from "@/core/api";
import { ACTIVE_SESSIONS } from "./activeSessions.constants";
import { ActiveSessionsResponse } from "./activeSessions.interface";

const { ENDPOINT } = ACTIVE_SESSIONS;

export async function getActiveSessions(): Promise<ActiveSessionsResponse> {
  const { data } = await api.get<ActiveSessionsResponse>(ENDPOINT);
  return data;
}
