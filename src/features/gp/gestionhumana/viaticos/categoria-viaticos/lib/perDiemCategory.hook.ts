import { useQuery } from "@tanstack/react-query";
import {
  findPerDiemCategoryById,
  getAllPerDiemCategory,
  getPerDiemCategory,
} from "./perDiemCategory.actions";
import { PER_DIEM_CATEGORY } from "./perDiemCategory.constants";
import { getPerDiemCategoryProps } from "./perDiemCategory.interface";

const { QUERY_KEY } = PER_DIEM_CATEGORY;

export function useGetPerDiemCategory(props: getPerDiemCategoryProps) {
  return useQuery({
    queryKey: [QUERY_KEY, props],
    queryFn: () => getPerDiemCategory(props),
  });
}

export function useGetAllPerDiemCategory(params?: Record<string, any>) {
  return useQuery({
    queryKey: [QUERY_KEY, "all", params],
    queryFn: () => getAllPerDiemCategory({ params }),
  });
}

export function useFindPerDiemCategoryById(id: number) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findPerDiemCategoryById(id),
    enabled: !!id,
  });
}
