import { useQuery } from "@tanstack/react-query";
import {
  CategoryObjectivePersonResponse,
  CategoryWeightReport,
  GlobalWeightReportItem,
  HierarchicalCategoryObjectiveResource,
  HierarchicalCategoryObjectiveResponse,
} from "./hierarchicalCategoryObjective.interface";
import {
  findHierarchicalCategoryObjectiveById,
  getCategoryObjectivePersonById,
  getCategoryWeightReport,
  getGlobalWeightReport,
  getHierarchicalCategoryObjective,
} from "./hierarchicalCategoryObjective.actions";
import { CATEGORY_OBJECTIVE } from "@/features/gp/gestionhumana/evaluaciondesempeño/categoria-objetivo-detalle/lib/hierarchicalCategoryObjective.constants";

const { QUERY_KEY } = CATEGORY_OBJECTIVE;

export const useHierarchicalCategoryObjectives = (
  params?: Record<string, any>,
) => {
  return useQuery<HierarchicalCategoryObjectiveResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getHierarchicalCategoryObjective({ params }),
  });
};

export const useHierarchicalCategoryObjectiveById = (id: number) => {
  return useQuery<HierarchicalCategoryObjectiveResource>({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findHierarchicalCategoryObjectiveById(id),
  });
};

export const useCategoryObjectiveWorkerById = (id: number) => {
  return useQuery<CategoryObjectivePersonResponse[]>({
    queryKey: [QUERY_KEY + "Person", id],
    queryFn: () => getCategoryObjectivePersonById(id),
  });
};

export const useGlobalWeightReport = (enabled = true) => {
  return useQuery<GlobalWeightReportItem[]>({
    queryKey: [QUERY_KEY + "GlobalWeightReport"],
    queryFn: () => getGlobalWeightReport(),
    enabled,
    refetchOnWindowFocus: false,
  });
};

export const useCategoryWeightReport = (categoryId: number, enabled = true) => {
  return useQuery<CategoryWeightReport>({
    queryKey: [QUERY_KEY + "WeightReport", categoryId],
    queryFn: () => getCategoryWeightReport(categoryId),
    enabled: enabled && categoryId > 0,
    refetchOnWindowFocus: false,
  });
};
