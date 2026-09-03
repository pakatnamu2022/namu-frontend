import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ASSETS } from "./assets.constants";
import {
  AssetResponse,
  AssetVehicleDetail,
  EligibleVehiclesResponse,
} from "./assets.interface";
import {
  deleteAsset,
  dispatchAssetMigration,
  getAssets,
  getEligibleVehicleDetail,
  getEligibleVehicles,
  storeAsset,
} from "./assets.actions";
import { successToast, errorToast } from "@/core/core.function";

const { QUERY_KEY } = ASSETS;

export const useAssets = (params?: Record<string, any>) => {
  return useQuery<AssetResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getAssets({ params }),
  });
};

export const useEligibleVehicles = (params?: Record<string, any>) => {
  return useQuery<EligibleVehiclesResponse>({
    queryKey: [QUERY_KEY, "eligible-vehicles", params],
    queryFn: () => getEligibleVehicles(params),
  });
};

export const useEligibleVehicleDetail = (id: number | null) => {
  return useQuery<AssetVehicleDetail>({
    queryKey: [QUERY_KEY, "eligible-vehicle-detail", id],
    queryFn: () => getEligibleVehicleDetail(id!),
    enabled: !!id && id > 0,
  });
};

export const useCreateAsset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: storeAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};

export const useDeleteAsset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteAsset(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      successToast(res?.message || "Activo eliminado correctamente");
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message || "Error al eliminar el activo",
      );
    },
  });
};

export const useDispatchAssetMigration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => dispatchAssetMigration(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      successToast(res?.message || "Migración despachada correctamente");
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message || "Error al despachar la migración",
      );
    },
  });
};
