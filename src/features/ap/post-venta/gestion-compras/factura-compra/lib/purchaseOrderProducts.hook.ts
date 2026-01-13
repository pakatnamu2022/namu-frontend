import { useQuery } from "@tanstack/react-query";
import {
  PurchaseOrderProductsResource,
  PurchaseOrderProductsResponse,
} from "./purchaseOrderProducts.interface.ts";
import {
  findPurchaseOrderProductsById,
  getAllPurchaseOrderProducts,
  getPurchaseOrderProducts,
} from "./purchaseOrderProducts.actions.ts";
import { PURCHASE_ORDER_PRODUCT } from "./purchaseOrderProducts.constants.ts";

const { QUERY_KEY } = PURCHASE_ORDER_PRODUCT;

export const usePurchaseOrderProducts = (params?: Record<string, any>) => {
  return useQuery<PurchaseOrderProductsResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getPurchaseOrderProducts({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllPurchaseOrderProducts = (params?: Record<string, any>) => {
  return useQuery<PurchaseOrderProductsResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllPurchaseOrderProducts({ params }),
    refetchOnWindowFocus: false,
  });
};

export const usePurchaseOrderProductsById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findPurchaseOrderProductsById(id),
    refetchOnWindowFocus: false,
  });
};
