import { useQuery } from "@tanstack/react-query";
import { PeriodResource, PeriodResponse } from "./period.interface";
import { getAllPeriods, getPeriod } from "./period.actions";

export const usePeriods = (params?: Record<string, any>) => {
  return useQuery<PeriodResponse>({
    queryKey: ["period", params],
    queryFn: () => getPeriod({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllPeriods = () => {
  return useQuery<PeriodResource[]>({
    queryKey: ["periodAll"],
    queryFn: () => getAllPeriods(),
    refetchOnWindowFocus: false,
  });
};
