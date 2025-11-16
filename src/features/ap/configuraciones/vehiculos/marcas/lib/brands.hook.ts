import { useQuery } from "@tanstack/react-query";
import { BrandsResource, BrandsResponse } from "./brands.interface";
import { findBrandsById, getAllBrands, getBrands } from "./brands.actions";
import { BRAND } from "./brands.constants";

const { QUERY_KEY } = BRAND;

export const useBrands = (params?: Record<string, any>) => {
  return useQuery<BrandsResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getBrands({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllBrands = (params?: Record<string, any>) => {
  return useQuery<BrandsResource[]>({
    queryKey: [QUERY_KEY, "all", params],
    queryFn: () => getAllBrands({ params }),
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
