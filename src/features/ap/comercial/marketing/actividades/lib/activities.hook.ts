import { useQuery } from "@tanstack/react-query";
import {
  getAllActivities,
  getActivities,
  findActivitiesById,
  getActivityTypes,
  getActivityChannels,
} from "./activities.actions";
import { ActivitiesResource, ActivitiesResponse } from "./activities.interface";
import { ACTIVITIES } from "./activities.constants";

const { QUERY_KEY } = ACTIVITIES;

export const useActivities = (params?: Record<string, any>) => {
  return useQuery<ActivitiesResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getActivities({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllActivities = (params?: Record<string, any>) => {
  return useQuery<ActivitiesResource[]>({
    queryKey: [QUERY_KEY, "all", params],
    queryFn: () => getAllActivities({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useActivitiesById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findActivitiesById(id),
    refetchOnWindowFocus: false,
    enabled: id > 0,
  });
};

/** Valores de "tipo de actividad" ya usados, para el combobox con autocompletar + crear. */
export const useActivityTypes = () => {
  return useQuery<string[]>({
    queryKey: [QUERY_KEY, "activity-types"],
    queryFn: getActivityTypes,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

/** Valores de "canal" ya usados, para el combobox con autocompletar + crear. */
export const useActivityChannels = () => {
  return useQuery<string[]>({
    queryKey: [QUERY_KEY, "channels"],
    queryFn: getActivityChannels,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
