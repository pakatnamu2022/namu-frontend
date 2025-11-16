import { useQuery } from "@tanstack/react-query";
import { REASONS_REJECTION } from "./reasonsRejection.constants";
import {
  ReasonsRejectionResource,
  ReasonsRejectionResponse,
} from "./reasonsRejection.interface";
import {
  findReasonsRejectionById,
  getAllReasonsRejection,
  getReasonsRejection,
} from "./reasonsRejection.actions";

const { QUERY_KEY } = REASONS_REJECTION;

export const useAllReasonsRejection = (params?: Record<string, any>) => {
  return useQuery<ReasonsRejectionResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllReasonsRejection({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useReasonsRejection = (params?: Record<string, any>) => {
  return useQuery<ReasonsRejectionResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getReasonsRejection({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useReasonsRejectionById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findReasonsRejectionById(id),
    refetchOnWindowFocus: false,
  });
};
