import { useQuery } from "@tanstack/react-query";
import { getAllPlans, getPlans, findPlansById } from "./plans.actions";
import { PlansResource, PlansResponse } from "./plans.interface";
import { PLANS } from "./plans.constants";

const { QUERY_KEY } = PLANS;

export const usePlans = (params?: Record<string, any>) => {
  return useQuery<PlansResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getPlans({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllPlans = (params?: Record<string, any>) => {
  return useQuery<PlansResource[]>({
    queryKey: [QUERY_KEY, "all", params],
    queryFn: () => getAllPlans({ params }),
    refetchOnWindowFocus: false,
  });
};

export const usePlansById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findPlansById(id),
    refetchOnWindowFocus: false,
    enabled: id > 0,
  });
};
