import { useQuery } from "@tanstack/react-query";
import { REASONS_DISCARDING_SPAREPART } from "./reasonDiscardingSparePart.constants.ts";
import {
  ReasonDiscardingSparePartResource,
  ReasonDiscardingSparePartResponse,
} from "./reasonDiscardingSparePart.interface.ts";
import {
  findReasonDiscardingSparePartById,
  getAllReasonDiscardingSparePart,
  getReasonDiscardingSparePart,
} from "./reasonDiscardingSparePart.actions.ts";

const { QUERY_KEY } = REASONS_DISCARDING_SPAREPART;

export const useReasonDiscardingSparePart = (params?: Record<string, any>) => {
  return useQuery<ReasonDiscardingSparePartResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getReasonDiscardingSparePart({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllReasonDiscardingSparePart = (
  params?: Record<string, any>
) => {
  return useQuery<ReasonDiscardingSparePartResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllReasonDiscardingSparePart({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useReasonDiscardingSparePartById = (id?: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findReasonDiscardingSparePartById(id!),
    refetchOnWindowFocus: false,
    enabled: !!id,
  });
};
