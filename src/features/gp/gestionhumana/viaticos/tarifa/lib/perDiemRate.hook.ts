import { useQuery } from "@tanstack/react-query";
import { PER_DIEM_RATE } from "./perDiemRate.constants";
import {
  PerDiemRateResource,
  PerDiemRateResponse,
} from "./perDiemRate.interface";
import {
  getAllPerDiemRate,
  getPerDiemRate,
  getPerDiemRateSearch,
} from "./perDiemRate.actions";
import { findBrandsById } from "@/features/ap/configuraciones/vehiculos/marcas/lib/brands.actions";

const { QUERY_KEY } = PER_DIEM_RATE;

export const usePerDiemRate = (params?: Record<string, any>) => {
  return useQuery<PerDiemRateResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getPerDiemRate({ params }),
    refetchOnWindowFocus: false,
  });
};

export const usePerDiemRateSearch = (params?: Record<string, any>) => {
  return useQuery<PerDiemRateResource[]>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getPerDiemRateSearch({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllPerDiemRate = (params?: Record<string, any>) => {
  return useQuery<PerDiemRateResource[]>({
    queryKey: [QUERY_KEY, "all", params],
    queryFn: () => getAllPerDiemRate({ params }),
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
