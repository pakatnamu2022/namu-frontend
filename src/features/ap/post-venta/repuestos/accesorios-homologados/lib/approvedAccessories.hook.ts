import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { STATUS_ACTIVE } from "@/core/core.constants.ts";
import { APPROVED_ACCESSORIES } from "./approvedAccessories.constants.ts";
import {
  ApprovedAccesoriesResource,
  ApprovedAccesoriesResponse,
} from "./approvedAccessories.interface.ts";
import {
  findApprovedAccesoriesById,
  getAllApprovedAccesories,
  getApprovedAccesories,
} from "./approvedAccessories.actions.ts";

const { QUERY_KEY } = APPROVED_ACCESSORIES;

export const useApprovedAccesories = (params?: Record<string, any>) => {
  return useQuery<ApprovedAccesoriesResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getApprovedAccesories({ params }),
  });
};

export const useAllApprovedAccesories = (params?: Record<string, any>) => {
  return useQuery<ApprovedAccesoriesResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllApprovedAccesories({ params }),
  });
};

/**
 * Búsqueda paginada para el FormSelectAsync del cotizador (solicitud de compra).
 * Filtra en el backend por `search` y por `body_type_id` (carrocería del modelo/VIN),
 * en lugar de traerse todos los accesorios con `all=true`.
 */
export const useApprovedAccesoriesSelect = (params: {
  search?: string;
  page?: number;
  per_page?: number;
  body_type_id?: number;
  [key: string]: any;
}) => {
  return useQuery<ApprovedAccesoriesResponse>({
    queryKey: [QUERY_KEY, "select", params],
    queryFn: () =>
      getApprovedAccesories({
        params: { ...params, status: STATUS_ACTIVE },
      }),
    placeholderData: keepPreviousData,
  });
};

export const useApprovedAccesoriesById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findApprovedAccesoriesById(id),
  });
};
