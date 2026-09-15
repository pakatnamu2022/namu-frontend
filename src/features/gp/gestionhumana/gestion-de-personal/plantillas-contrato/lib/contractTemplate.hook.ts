import { useQuery } from "@tanstack/react-query";
import {
  ContractTemplateResource,
  ContractTemplateResponse,
} from "./contractTemplate.interface.ts";
import {
  getAllContractTemplates,
  getContractTemplates,
} from "./contractTemplate.actions.ts";
import { CONTRACT_TEMPLATE } from "./contractTemplate.constant.ts";

const { QUERY_KEY } = CONTRACT_TEMPLATE;

export const useContractTemplates = (params?: Record<string, any>) => {
  return useQuery<ContractTemplateResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getContractTemplates({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllContractTemplates = (params?: Record<string, any>) => {
  return useQuery<ContractTemplateResource[]>({
    queryKey: [QUERY_KEY + "All", params],
    queryFn: () => getAllContractTemplates({ params }),
    refetchOnWindowFocus: false,
  });
};
