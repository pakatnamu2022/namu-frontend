import { api } from "@/core/api";
import {
  NotificationsResponse,
  UnreadCountResponse,
} from "./notifications.interface";
import { NOTIFICATIONS } from "./notifications.constants";

const { ENDPOINT } = NOTIFICATIONS;

export async function getNotifications(
  params?: Record<string, any>,
): Promise<NotificationsResponse> {
  const { data } = await api.get<NotificationsResponse>(ENDPOINT, { params });
  return data;
}

export async function getUnreadCount(): Promise<UnreadCountResponse> {
  const { data } = await api.get<UnreadCountResponse>(
    `${ENDPOINT}/unread-count`,
  );
  return data;
}

export async function readAllNotifications(): Promise<void> {
  await api.patch(`${ENDPOINT}/read-all`);
}

export async function readNotification(id: number): Promise<void> {
  await api.patch(`${ENDPOINT}/${id}/read`);
}

export async function deleteNotification(id: number): Promise<void> {
  await api.delete(`${ENDPOINT}/${id}`);
}
