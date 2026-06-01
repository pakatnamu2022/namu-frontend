import { useQuery } from "@tanstack/react-query";
import { CUENTAS_POR_COBRAR } from "./cuentasPorCobrar.constants";
import {
  getCuentasPorCobrar,
  getCuentaPorCobrarById,
} from "./cuentasPorCobrar.actions";
import type { CuentasPorCobrarFilters } from "./cuentasPorCobrar.interface";

const { QUERY_KEY } = CUENTAS_POR_COBRAR;

export const useCuentasPorCobrar = (filters: CuentasPorCobrarFilters) => {
  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: () => getCuentasPorCobrar(filters),
    refetchOnWindowFocus: false,
  });
};

export const useCuentaPorCobrarById = (id: number | null) => {
  return useQuery({
    queryKey: [QUERY_KEY, "detail", id],
    queryFn: () => getCuentaPorCobrarById(id!),
    refetchOnWindowFocus: false,
    enabled: !!id,
  });
};
