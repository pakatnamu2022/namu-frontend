import { useQuery } from "@tanstack/react-query";
import {
  HierarchicalCategoryResource,
  HierarchicalCategoryResponse,
} from "./hierarchicalCategory.interface";
import {
  findHierarchicalCategoryById,
  getAllHierarchicalCategory,
  getHierarchicalCategory,
  useAllCategoriesWithBoss,
} from "./hierarchicalCategory.actions";
import { HIERARCHICAL_CATEGORY } from "./hierarchicalCategory.constants";

const { QUERY_KEY } = HIERARCHICAL_CATEGORY;

export const useHierarchicalCategorys = (params?: Record<string, any>) => {
  return useQuery<HierarchicalCategoryResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getHierarchicalCategory({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllHierarchicalCategories = () => {
  return useQuery<HierarchicalCategoryResource[]>({
    queryKey: [QUERY_KEY, "all"],
    queryFn: () => getAllHierarchicalCategory(),
    refetchOnWindowFocus: false,
  });
};

export const useHierarchicalCategoryById = (id: number) => {
  return useQuery<HierarchicalCategoryResource>({
    queryKey: [QUERY_KEY, "ById", id],
    queryFn: () => findHierarchicalCategoryById(id),
    refetchOnWindowFocus: false,
  });
};

export const useAllCategoriesWithBosses = (idCycle: number) => {
  return useQuery<HierarchicalCategoryResource[]>({
    queryKey: ["allCategoriesWithBoss"],
    queryFn: () => useAllCategoriesWithBoss(idCycle),
    refetchOnWindowFocus: false,
  });
};
