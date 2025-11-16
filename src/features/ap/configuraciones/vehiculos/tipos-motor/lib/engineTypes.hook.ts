import {
  findEngineTypesById,
  getAllEngineTypes,
  getEngineTypes,
} from "./engineTypes.actions";
import { ENGINE_TYPES } from "./engineTypes.constants";
import {
  EngineTypesResource,
  EngineTypesResponse,
} from "./engineTypes.interface";
import { useQuery } from "@tanstack/react-query";

const { QUERY_KEY } = ENGINE_TYPES;

export const useEngineTypes = (params?: Record<string, any>) => {
  return useQuery<EngineTypesResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getEngineTypes({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllEngineTypes = (params?: Record<string, any>) => {
  return useQuery<EngineTypesResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllEngineTypes({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useEngineTypesById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findEngineTypesById(id),
    refetchOnWindowFocus: false,
  });
};
