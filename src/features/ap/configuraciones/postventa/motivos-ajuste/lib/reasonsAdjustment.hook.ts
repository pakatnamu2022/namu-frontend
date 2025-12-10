import { useQuery } from "@tanstack/react-query";
import {
  ReasonsAdjustmentResource,
  ReasonsAdjustmentResponse,
} from "./reasonsAdjustment.interface.ts";
import {
  findReasonsAdjustmentById,
  getAllReasonsAdjustment,
  getReasonsAdjustment,
} from "./reasonsAdjustment.actions.ts";
import { REASONS_ADJUSTMENT } from "./reasonsAdjustment.constants.ts";

const { QUERY_KEY } = REASONS_ADJUSTMENT;

export const useReasonsAdjustment = (params?: Record<string, any>) => {
  return useQuery<ReasonsAdjustmentResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getReasonsAdjustment({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllReasonsAdjustment = (params?: Record<string, any>) => {
  return useQuery<ReasonsAdjustmentResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllReasonsAdjustment({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useReasonsAdjustmentById = (id?: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findReasonsAdjustmentById(id!),
    refetchOnWindowFocus: false,
    enabled: !!id,
  });
};
