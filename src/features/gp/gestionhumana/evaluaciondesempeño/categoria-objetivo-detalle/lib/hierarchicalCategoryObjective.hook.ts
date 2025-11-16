import { useQuery } from "@tanstack/react-query";
import {
  CategoryObjectivePersonResponse,
  HierarchicalCategoryObjectiveResource,
  HierarchicalCategoryObjectiveResponse,
} from "./hierarchicalCategoryObjective.interface";
import {
  findHierarchicalCategoryObjectiveById,
  getCategoryObjectivePersonById,
  getHierarchicalCategoryObjective,
} from "./hierarchicalCategoryObjective.actions";
import { CATEGORY_OBJECTIVE } from "@/features/gp/gestionhumana/evaluaciondesempeño/categoria-objetivo-detalle/lib/hierarchicalCategoryObjective.constants";

const { QUERY_KEY } = CATEGORY_OBJECTIVE;

export const useHierarchicalCategoryObjectives = (
  params?: Record<string, any>
) => {
  return useQuery<HierarchicalCategoryObjectiveResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getHierarchicalCategoryObjective({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useHierarchicalCategoryObjectiveById = (id: number) => {
  return useQuery<HierarchicalCategoryObjectiveResource>({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findHierarchicalCategoryObjectiveById(id),
    refetchOnWindowFocus: false,
  });
};

export const useCategoryObjectiveWorkerById = (id: number) => {
  return useQuery<CategoryObjectivePersonResponse[]>({
    queryKey: [QUERY_KEY + "Person", id],
    queryFn: () => getCategoryObjectivePersonById(id),
    refetchOnWindowFocus: false,
  });
};
