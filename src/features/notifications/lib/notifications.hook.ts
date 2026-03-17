import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { NOTIFICATIONS } from "./notifications.constants";
import {
  deleteNotification,
  getNotifications,
  getUnreadCount,
  readAllNotifications,
  readNotification,
} from "./notifications.actions";

const { QUERY_KEY, UNREAD_COUNT_QUERY_KEY } = NOTIFICATIONS;

export const useUnreadCount = () => {
  return useQuery({
    queryKey: [UNREAD_COUNT_QUERY_KEY],
    queryFn: getUnreadCount,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
};

export const useNotifications = (
  params?: Record<string, any>,
  enabled = true,
) => {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getNotifications(params),
    refetchOnWindowFocus: false,
    enabled,
  });
};

export const useReadAllNotifications = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: readAllNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [UNREAD_COUNT_QUERY_KEY] });
    },
  });
};

export const useReadNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => readNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [UNREAD_COUNT_QUERY_KEY] });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [UNREAD_COUNT_QUERY_KEY] });
    },
  });
};
