import { useQuery } from "@tanstack/react-query";
import { ApBankResource, ApBankResponse } from "./apBank.interface";
import { getAllApBank, getApBank } from "./apBank.actions";
import { findBrandsById } from "@/features/ap/configuraciones/vehiculos/marcas/lib/brands.actions";
import { BANK_AP } from "./apBank.constants";

const { QUERY_KEY } = BANK_AP;

export const useApBank = (params?: Record<string, any>) => {
  return useQuery<ApBankResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getApBank({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllApBank = (params?: Record<string, any>) => {
  return useQuery<ApBankResource[]>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getAllApBank({ params }),
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
