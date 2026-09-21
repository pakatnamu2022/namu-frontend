import { useQuery } from "@tanstack/react-query";
import { SctrRateResponse } from "./sctr-rate.interface";
import { getSctrRates } from "./sctr-rate.actions";
import { SCTR_RATE } from "./sctr-rate.constants";

const { QUERY_KEY } = SCTR_RATE;

export const useSctrRates = (params?: Record<string, any>) => {
  return useQuery<SctrRateResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getSctrRates(params),
    refetchOnWindowFocus: false,
  });
};
