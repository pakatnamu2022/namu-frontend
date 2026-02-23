import { useQuery } from "@tanstack/react-query";
import {
  TelephonePlanResource,
  TelephonePlanResponse,
} from "./telephonePlan.interface";
import { getAllTelephonePlans, getTelephonePlans } from "./telephonePlan.actions";

export const useTelephonePlans = (params?: Record<string, any>) => {
  return useQuery<TelephonePlanResponse>({
    queryKey: ["telephonePlan", params],
    queryFn: () => getTelephonePlans({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllTelephonePlans = () => {
  return useQuery<TelephonePlanResource[]>({
    queryKey: ["telephonePlanAll"],
    queryFn: () => getAllTelephonePlans(),
    refetchOnWindowFocus: false,
  });
};
