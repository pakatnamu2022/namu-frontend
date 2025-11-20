import { useQuery } from "@tanstack/react-query";
import {
  View,
  ViewPermissionResponse,
  ViewResource,
  ViewResponse,
} from "./view.interface";
import { getAllView, getView, getViewPermission } from "./view.actions";

export const useViews = (params?: Record<string, any>) => {
  return useQuery<ViewResponse>({
    queryKey: ["view", params],
    queryFn: () => getView({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllViews = () => {
  return useQuery<ViewResource[]>({
    queryKey: ["viewAll"],
    queryFn: () => getAllView(),
    refetchOnWindowFocus: false,
  });
};

export const useAllViewPermission = (params?: Record<string, any>) => {
  return useQuery<View[]>({
    queryKey: ["viewPermission", params],
    queryFn: () => getViewPermission({ params }),
    refetchOnWindowFocus: false,
  });
};
