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

export function useGetAllPerDiemCategory(props: getPerDiemCategoryProps) {
  return useQuery({
    queryKey: [QUERY_KEY, "all", props],
    queryFn: () => getAllPerDiemCategory(props),
  });
}

export function useFindPerDiemCategoryById(id: number) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findPerDiemCategoryById(id),
    enabled: !!id,
  });
}
