import { useQuery } from "@tanstack/react-query";
import { SedeResource, SedeResponse } from "./sede.interface";
import {
  getAllAvailableLocationsShop,
  getAllSede,
  getMySede,
  getSede,
} from "./sede.actions";
import { ShopSedeResource } from "@/src/features/ap/configuraciones/ventas/tiendas/lib/shop.interface";

export const useSedes = (params?: Record<string, any>) => {
  return useQuery<SedeResponse>({
    queryKey: ["sede", params],
    queryFn: () => getSede({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllSedes = (params?: Record<string, any>) => {
  return useQuery<SedeResource[]>({
    queryKey: ["sedeAll", params],
    queryFn: () => getAllSede(params),
    refetchOnWindowFocus: false,
  });
};

export const useMySedes = (params?: Record<string, any>) => {
  return useQuery<SedeResource[]>({
    queryKey: ["mySedes", params],
    queryFn: () => getMySede({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllAvailableLocationsShop = (params?: Record<string, any>) => {
  return useQuery<ShopSedeResource[]>({
    queryKey: ["availableLocationsShop", params],
    queryFn: () => getAllAvailableLocationsShop(params),
    refetchOnWindowFocus: false,
  });
};
