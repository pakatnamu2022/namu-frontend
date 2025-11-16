import { useQuery } from "@tanstack/react-query";
import {
  CategoryChecklistResource,
  CategoryChecklistResponse,
} from "./categoryChecklist.interface";
import {
  findCategoryChecklistById,
  getAllCategoryChecklist,
  getCategoryChecklist,
} from "./categoryChecklist.actions";
import { CATEGORY_CHECKLIST } from "./categoryChecklist.constants";

const { QUERY_KEY } = CATEGORY_CHECKLIST;

export const useCategoryChecklist = (params?: Record<string, any>) => {
  return useQuery<CategoryChecklistResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getCategoryChecklist({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllCategoryChecklist = (params?: Record<string, any>) => {
  return useQuery<CategoryChecklistResource[]>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getAllCategoryChecklist({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useCategoryChecklistById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findCategoryChecklistById(id),
    refetchOnWindowFocus: false,
  });
};
