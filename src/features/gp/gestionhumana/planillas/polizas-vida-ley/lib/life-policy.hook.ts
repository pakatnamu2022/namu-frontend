import { useQuery } from "@tanstack/react-query";
import { LifePolicyResource, LifePolicyResponse } from "./life-policy.interface";
import { getLifePolicies, getLifePolicy } from "./life-policy.actions";
import { LIFE_POLICY } from "./life-policy.constants";

const { QUERY_KEY } = LIFE_POLICY;

export const useLifePolicies = (params?: Record<string, any>) => {
  return useQuery<LifePolicyResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getLifePolicies(params),
    refetchOnWindowFocus: false,
  });
};

export const useLifePolicy = (id: number | null) => {
  return useQuery<LifePolicyResource>({
    queryKey: [QUERY_KEY, "detail", id],
    queryFn: () => getLifePolicy(id as number),
    enabled: !!id,
    refetchOnWindowFocus: false,
  });
};
