import { useQuery } from "@tanstack/react-query";
import { ECONOMIC_ACTIVITY } from "./economicActivity.constants";
import {
  EconomicActivityResource,
  EconomicActivityResponse,
} from "./economicActivity.interface";
import {
  findEconomicActivityById,
  getAllEconomicActivity,
  getEconomicActivity,
} from "./economicActivity.actions";

const { QUERY_KEY } = ECONOMIC_ACTIVITY;

export const useEconomicActivity = (params?: Record<string, any>) => {
  return useQuery<EconomicActivityResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getEconomicActivity({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllEconomicActivity = (params?: Record<string, any>) => {
  return useQuery<EconomicActivityResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllEconomicActivity({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useEconomicActivityById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findEconomicActivityById(id),
    refetchOnWindowFocus: false,
  });
};
