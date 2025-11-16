import { useQuery } from "@tanstack/react-query";
import { ParameterResource, ParameterResponse } from "./parameter.interface";
import { getAllParameters, getParameter } from "./parameter.actions";
import { PARAMETER, PARAMETER_SCALES } from "./parameter.constans";

const { QUERY_KEY } = PARAMETER;

export const useParameters = (params?: Record<string, any>) => {
  return useQuery<ParameterResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getParameter({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllParameters = (params?: Record<string, any>) => {
  return useQuery<ParameterResource[]>({
    queryKey: [QUERY_KEY + "All", params],
    queryFn: () => getAllParameters({ params }),
    refetchOnWindowFocus: false,
  });
};

export function getScales(count: number) {
  if (count === 6) return PARAMETER_SCALES;
  if (count === 5) return PARAMETER_SCALES.filter((_, i) => i !== 4);
  if (count === 4) return PARAMETER_SCALES.filter((_, i) => i !== 2 && i !== 4);
  return PARAMETER_SCALES.slice(0, count);
}
