import { useQuery } from "@tanstack/react-query";
import {
  ReceptionResource,
  ReceptionResponse,
} from "./receptions-products.interface";
import {
  findReceptionById,
  getAllReceptions,
  getReceptions,
} from "./receptions-products.actions";
import { RECEPTION } from "./receptions-products.constants";

const { QUERY_KEY } = RECEPTION;

export const useReceptions = (
  params?: Record<string, any>,
  purchaseOrderId?: number
) => {
  return useQuery<ReceptionResponse>({
    queryKey: [QUERY_KEY, params, purchaseOrderId],
    queryFn: () => getReceptions({ params, purchaseOrderId }),
    refetchOnWindowFocus: false,
  });
};

export const useAllReceptions = (
  params?: Record<string, any>,
  purchaseOrderId?: number
) => {
  return useQuery<ReceptionResource[]>({
    queryKey: [QUERY_KEY, "all", purchaseOrderId],
    queryFn: () => getAllReceptions({ params, purchaseOrderId }),
    refetchOnWindowFocus: false,
  });
};

export const useReceptionById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findReceptionById(id),
    refetchOnWindowFocus: false,
  });
};
