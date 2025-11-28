import { useQuery } from "@tanstack/react-query";
import { TYPE_PLANNING } from "./typesPlanning.constants.ts";
import {
  TypesPlanningResource,
  TypesPlanningResponse,
} from "./typesPlanning.interface.ts";
import {
  findTypesPlanningById,
  getAllTypesPlanning,
  getTypesPlanning,
} from "./typesPlanning.actions.ts";

const { QUERY_KEY } = TYPE_PLANNING;

export const useTypesPlanning = (params?: Record<string, any>) => {
  return useQuery<TypesPlanningResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getTypesPlanning({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllTypesPlanning = (params?: Record<string, any>) => {
  return useQuery<TypesPlanningResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllTypesPlanning({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useTypesPlanningById = (id?: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findTypesPlanningById(id!),
    refetchOnWindowFocus: false,
    enabled: !!id,
  });
};
