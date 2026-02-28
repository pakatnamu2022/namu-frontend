import { useQuery } from "@tanstack/react-query";
import { ModelsVnResource, ModelsVnResponse } from "./modelsVn.interface";
import {
  getAllModelsVn,
  getModelsVn,
  getModelsVnSearch,
} from "./modelsVn.actions";
import { findBrandsById } from "../../marcas/lib/brands.actions";
import { MODELS_VN } from "./modelsVn.constanst";

const { QUERY_KEY } = MODELS_VN;

export const useModelsVn = (params?: Record<string, any>) => {
  return useQuery<ModelsVnResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getModelsVn({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useModelsVnSearch = (params?: Record<string, any>) => {
  return useQuery<ModelsVnResource[]>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getModelsVnSearch({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllModelsVn = (params?: Record<string, any>) => {
  return useQuery<ModelsVnResource[]>({
    queryKey: [QUERY_KEY, "all", params],
    queryFn: () => getAllModelsVn({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useBrandById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findBrandsById(id),
    refetchOnWindowFocus: false,
  });
};
