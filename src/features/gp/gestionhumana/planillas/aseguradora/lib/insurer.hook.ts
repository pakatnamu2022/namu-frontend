import { useQuery } from "@tanstack/react-query";
import { INSURER } from "./insurer.constants.ts";
import { findInsurerById, getInsurers } from "./insurer.actions.ts";
import { SuppliersResponse } from "@/features/ap/comercial/proveedores/lib/suppliers.interface.ts";

const { QUERY_KEY } = INSURER;

export const useInsurers = (params?: Record<string, any>) => {
  return useQuery<SuppliersResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getInsurers(params),
    refetchOnWindowFocus: false,
  });
};

export const useInsurerById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findInsurerById(id),
    refetchOnWindowFocus: false,
    enabled: id > 0,
  });
};
