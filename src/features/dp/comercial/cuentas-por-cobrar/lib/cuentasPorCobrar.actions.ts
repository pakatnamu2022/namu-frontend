import { api } from "@/core/api";
import { CUENTAS_POR_COBRAR } from "./cuentasPorCobrar.constants";
import type {
  CuentasPorCobrarResponse,
  CuentaPorCobrar,
  CuentasPorCobrarFilters,
} from "./cuentasPorCobrar.interface";

const { ENDPOINT, COMPANY } = CUENTAS_POR_COBRAR;

export async function getCuentasPorCobrar(
  filters: CuentasPorCobrarFilters,
): Promise<CuentasPorCobrarResponse> {
  const params: Record<string, any> = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      params[key] = value;
    }
  });
  const { data } = await api.get<CuentasPorCobrarResponse>(ENDPOINT, { params });
  return data;
}

export async function getCuentaPorCobrarById(id: number): Promise<CuentaPorCobrar> {
  const { data } = await api.get<CuentaPorCobrar>(`${ENDPOINT}/${id}`);
  return data;
}

export async function syncCuentasPorCobrar(): Promise<void> {
  await api.post(`${ENDPOINT}/sync`, { company: COMPANY });
}

export async function addCuentaComment(id: number, comment: string): Promise<void> {
  await api.post(`${ENDPOINT}/${id}/comments`, { comment });
}
