import { useQuery } from "@tanstack/react-query";
import { ModelVnSyncLogsResponse, ModelsVnResource, ModelsVnResponse } from "./modelsVn.interface";
import {
  findModelsVnById,
  getAllModelsVn,
  getModelVnSyncLogs,
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
  });
};

export const useModelsVnSearch = (params?: Record<string, any>) => {
  return useQuery<ModelsVnResource[]>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getModelsVnSearch({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useModelVnById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findModelsVnById(id),
    enabled: !!id,
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

export const useModelVnSyncLogs = (params?: Record<string, any>) => {
  return useQuery<ModelVnSyncLogsResponse>({
    queryKey: [QUERY_KEY, "sync-logs", params],
    queryFn: () => getModelVnSyncLogs(params),
    refetchOnWindowFocus: false,
  });
};
