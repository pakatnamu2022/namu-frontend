export interface NotificationResource {
  id: number;
  title: string;
  body: string;
  type: string;
  route?: string;
  data: Record<string, any>;
  read_at: string | null;
  is_read: boolean;
  created_at: string;
}

export interface NotificationsResponse {
  data: NotificationResource[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface UnreadCountResponse {
  count: number;
}
