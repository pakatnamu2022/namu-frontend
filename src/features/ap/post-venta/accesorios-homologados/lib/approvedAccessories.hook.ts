import { useQuery } from "@tanstack/react-query";
import { APPROVED_ACCESSORIES } from "./approvedAccessories.constants";
import {
  ApprovedAccesoriesResource,
  ApprovedAccesoriesResponse,
} from "./approvedAccessories.interface";
import {
  findApprovedAccesoriesById,
  getAllApprovedAccesories,
  getApprovedAccesories,
} from "./approvedAccessories.actions";

const { QUERY_KEY } = APPROVED_ACCESSORIES;

export const useApprovedAccesories = (params?: Record<string, any>) => {
  return useQuery<ApprovedAccesoriesResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getApprovedAccesories({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllApprovedAccesories = (params?: Record<string, any>) => {
  return useQuery<ApprovedAccesoriesResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllApprovedAccesories({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useApprovedAccesoriesById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findApprovedAccesoriesById(id),
    refetchOnWindowFocus: false,
  });
};
