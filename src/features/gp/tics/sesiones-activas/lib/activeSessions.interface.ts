export interface ActiveSessionUser {
  user_id: number;
  username: string;
  name: string;
  cargo: string | null;
  sede: string | null;
  empresa: string | null;
  login_at: string | null;
  last_seen_at: string | null;
  active_minutes: number;
  session_count: number;
  status: "online" | "inactive";
}

export interface ActiveSessionsResponse {
  total: number;
  online: number;
  users: ActiveSessionUser[];
}
