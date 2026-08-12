import { useQuery } from "@tanstack/react-query";
import {
  getAllPurchaseOrders,
  getPurchaseOrders,
  findPurchaseOrdersById,
} from "./purchaseOrders.actions";
import {
  PurchaseOrdersResource,
  PurchaseOrdersResponse,
} from "./purchaseOrders.interface";
import { MARKETING_PURCHASE_ORDERS } from "./purchaseOrders.constants";

const { QUERY_KEY } = MARKETING_PURCHASE_ORDERS;

export const usePurchaseOrders = (params?: Record<string, any>) => {
  return useQuery<PurchaseOrdersResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getPurchaseOrders({ params }),
  });
};

export const useAllPurchaseOrders = (params?: Record<string, any>) => {
  return useQuery<PurchaseOrdersResource[]>({
    queryKey: [QUERY_KEY, "all", params],
    queryFn: () => getAllPurchaseOrders({ params }),
  });
};

export const usePurchaseOrdersById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findPurchaseOrdersById(id),

    enabled: id > 0,
  });
};
