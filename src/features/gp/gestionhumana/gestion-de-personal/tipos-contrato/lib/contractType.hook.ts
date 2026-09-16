import { useQuery } from "@tanstack/react-query";
import {
  ContractTypeResource,
  ContractTypeResponse,
} from "./contractType.interface.ts";
import {
  getAllContractTypes,
  getContractTypes,
} from "./contractType.actions.ts";
import { CONTRACT_TYPE } from "./contractType.constant.ts";

const { QUERY_KEY } = CONTRACT_TYPE;

export const useContractTypes = (params?: Record<string, any>) => {
  return useQuery<ContractTypeResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getContractTypes({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllContractTypes = (params?: Record<string, any>) => {
  return useQuery<ContractTypeResource[]>({
    queryKey: [QUERY_KEY + "All", params],
    queryFn: () => getAllContractTypes({ params }),
    refetchOnWindowFocus: false,
  });
};
