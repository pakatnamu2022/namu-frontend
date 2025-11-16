import { useQuery } from "@tanstack/react-query";
import { FamiliesResource, FamiliesResponse } from "./families.interface";
import {
  findFamiliesById,
  getAllFamilies,
  getFamilies,
} from "./families.actions";
import { FAMILIES } from "./families.constants";

const { QUERY_KEY } = FAMILIES;

export const useFamilies = (params?: Record<string, any>) => {
  return useQuery<FamiliesResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getFamilies({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllFamilies = (params?: Record<string, any>) => {
  return useQuery<FamiliesResource[]>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getAllFamilies({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useFamiliesById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findFamiliesById(id),
    refetchOnWindowFocus: false,
  });
};
