import { useQuery } from "@tanstack/react-query";
import {
  DevelopmentPlanResource,
  DevelopmentPlanResponse,
} from "./developmentPlan.interface";
import {
  getDevelopmentPlanById,
  getAllDevelopmentPlans,
  getDevelopmentPlans,
} from "./developmentPlan.actions";
import { DEVELOPMENT_PLAN } from "./developmentPlan.constants";

const { QUERY_KEY } = DEVELOPMENT_PLAN;

export const useDevelopmentPlans = (params?: Record<string, any>) => {
  return useQuery<DevelopmentPlanResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getDevelopmentPlans({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllDevelopmentPlans = (params?: Record<string, any>) => {
  return useQuery<DevelopmentPlanResource[]>({
    queryKey: [QUERY_KEY, "all", params],
    queryFn: () => getAllDevelopmentPlans({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useDevelopmentPlanById = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => getDevelopmentPlanById(id),
    refetchOnWindowFocus: false,
    enabled: enabled && id > 0,
  });
};
