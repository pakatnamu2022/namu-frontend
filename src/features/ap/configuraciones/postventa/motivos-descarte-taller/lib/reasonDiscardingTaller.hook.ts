import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import {
  ReasonDiscardingTallerResource,
  ReasonDiscardingTallerResponse,
} from "./reasonDiscardingTaller.interface.ts";
import {
  findReasonDiscardingTallerById,
  getAllReasonDiscardingTaller,
  getReasonDiscardingTaller,
} from "./reasonDiscardingTaller.actions.ts";
import { REASONS_DISCARDING_TALLER } from "./reasonDiscardingTaller.constants.ts";

const { QUERY_KEY } = REASONS_DISCARDING_TALLER;

export const useReasonDiscardingTaller = (params?: Record<string, any>) => {
  return useQuery<ReasonDiscardingTallerResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getReasonDiscardingTaller({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllReasonDiscardingTaller = (
  params?: Record<string, any>,
  options?: Partial<UseQueryOptions<ReasonDiscardingTallerResource[]>>,
) => {
  return useQuery<ReasonDiscardingTallerResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllReasonDiscardingTaller({ params }),
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const useReasonDiscardingTallerById = (id?: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findReasonDiscardingTallerById(id!),
    refetchOnWindowFocus: false,
    enabled: !!id,
  });
};
