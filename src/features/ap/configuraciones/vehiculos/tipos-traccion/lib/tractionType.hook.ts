import { useQuery } from "@tanstack/react-query";
import {
  TractionTypeResource,
  TractionTypeResponse,
} from "./tractionType.interface";
import {
  findTractionTypeById,
  getAllTractionType,
  getTractionType,
} from "./tractionType.actions";
import { TRACTION_TYPE } from "./tractionType.constants";

const { QUERY_KEY } = TRACTION_TYPE;

export const useTractionType = (params?: Record<string, any>) => {
  return useQuery<TractionTypeResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getTractionType({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllTractionType = (params?: Record<string, any>) => {
  return useQuery<TractionTypeResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllTractionType({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useTractionTypeById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findTractionTypeById(id),
    refetchOnWindowFocus: false,
  });
};
