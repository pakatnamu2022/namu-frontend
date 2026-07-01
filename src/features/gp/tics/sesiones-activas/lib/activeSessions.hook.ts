import { useQuery } from "@tanstack/react-query";
import { ACTIVE_SESSIONS } from "./activeSessions.constants";
import { ActiveSessionsResponse } from "./activeSessions.interface";
import { getActiveSessions } from "./activeSessions.actions";

const { QUERY_KEY } = ACTIVE_SESSIONS;

const REFRESH_INTERVAL_MS = 30_000;

export const useActiveSessions = () => {
  return useQuery<ActiveSessionsResponse>({
    queryKey: [QUERY_KEY],
    queryFn: getActiveSessions,
    refetchOnWindowFocus: false,
    refetchInterval: REFRESH_INTERVAL_MS,
  });
};
