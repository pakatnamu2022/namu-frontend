import { useQuery } from "@tanstack/react-query";
import { SUPPLIERS } from "./suppliers.constants";
import { SuppliersResource, SuppliersResponse } from "./suppliers.interface";
import {
  findSuppliersById,
  getAllSuppliers,
  getSuppliers,
} from "./suppliers.actions";

const { QUERY_KEY } = SUPPLIERS;

export const useSuppliers = (params?: Record<string, any>) => {
  return useQuery<SuppliersResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getSuppliers({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllSuppliers = (params?: Record<string, any>) => {
  return useQuery<SuppliersResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllSuppliers({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useSuppliersById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findSuppliersById(id),
    refetchOnWindowFocus: false,
  });
};
