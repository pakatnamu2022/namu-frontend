import { useQuery } from "@tanstack/react-query";
import { ExclusionResponse } from "./exclusion.interface";
import { getExclusions } from "./exclusion.actions";
import { PAYROLL_EXCLUSION } from "./exclusion.constants";

const { QUERY_KEY } = PAYROLL_EXCLUSION;

export const useExclusions = (params?: Record<string, any>) => {
  return useQuery<ExclusionResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getExclusions(params),
    refetchOnWindowFocus: false,
  });
};
