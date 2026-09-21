import { useQuery } from "@tanstack/react-query";
import { SubsidyResponse } from "./subsidy.interface";
import { getSubsidies } from "./subsidy.actions";
import { SUBSIDY } from "./subsidy.constants";

const { QUERY_KEY } = SUBSIDY;

export const useSubsidies = (params?: Record<string, any>) => {
  return useQuery<SubsidyResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getSubsidies(params),
    refetchOnWindowFocus: false,
  });
};
