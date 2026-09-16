import { useQuery } from "@tanstack/react-query";
import { ContractResponse } from "./contract.interface.ts";
import { getContracts, getExpiringContracts } from "./contract.actions.ts";
import { CONTRACT } from "./contract.constant.ts";

const { QUERY_KEY } = CONTRACT;

export const useContracts = (params?: Record<string, any>) => {
  return useQuery<ContractResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getContracts({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useExpiringContracts = (days: number = 50) => {
  return useQuery({
    queryKey: [QUERY_KEY, "expiring", days],
    queryFn: () => getExpiringContracts(days),
    refetchOnWindowFocus: false,
  });
};
