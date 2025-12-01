import { useQuery } from "@tanstack/react-query";
import { TYPES_CATEGORY } from "./typesCategory.constants";
import {
  TypesCategoryResource,
  TypesCategoryResponse,
} from "./typesCategory.interface";
import {
  findTypesCategoryById,
  getAllTypesCategory,
  getTypesCategory,
} from "./typesCategory.actions";

const { QUERY_KEY } = TYPES_CATEGORY;

export const useTypesCategory = (params?: Record<string, any>) => {
  return useQuery<TypesCategoryResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getTypesCategory({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllTypesCategory = (params?: Record<string, any>) => {
  return useQuery<TypesCategoryResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllTypesCategory({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useTypesCategoryById = (id?: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findTypesCategoryById(id!),
    refetchOnWindowFocus: false,
    enabled: !!id,
  });
};
