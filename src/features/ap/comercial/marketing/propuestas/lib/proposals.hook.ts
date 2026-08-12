import { useQuery } from "@tanstack/react-query";
import {
  getAllProposals,
  getProposals,
  findProposalsById,
} from "./proposals.actions";
import { ProposalsResource, ProposalsResponse } from "./proposals.interface";
import { PROPOSALS } from "./proposals.constants";

const { QUERY_KEY } = PROPOSALS;

export const useProposals = (params?: Record<string, any>) => {
  return useQuery<ProposalsResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getProposals({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllProposals = (params?: Record<string, any>) => {
  return useQuery<ProposalsResource[]>({
    queryKey: [QUERY_KEY, "all", params],
    queryFn: () => getAllProposals({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useProposalsById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findProposalsById(id),
    refetchOnWindowFocus: false,
    enabled: id > 0,
  });
};
