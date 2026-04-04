import { useQuery } from "@tanstack/react-query";
import { SUPPLIER_ORDER } from "./supplierOrder.constants.ts";
import {
  SupplierOrderResource,
  SupplierOrderResponse,
} from "./supplierOrder.interface.ts";
import {
  findSupplierOrderById,
  getAllSupplierOrder,
  getSupplierOrder,
  pendingProductsById,
} from "./supplierOrder.actions.ts";

const { QUERY_KEY } = SUPPLIER_ORDER;

export const useSupplierOrder = (
  queryParams?: Record<string, any>,
  options?: { enabled?: boolean },
) => {
  return useQuery<SupplierOrderResponse>({
    queryKey: [QUERY_KEY, queryParams],
    queryFn: () => getSupplierOrder(queryParams),
    refetchOnWindowFocus: false,
    enabled: options?.enabled ?? true,
  });
};

export const useAllSupplierOrder = (params?: Record<string, any>) => {
  return useQuery<SupplierOrderResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllSupplierOrder({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useSupplierOrderById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findSupplierOrderById(id),
    refetchOnWindowFocus: false,
  });
};

export const usePendingProductsById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, "pending-products", id],
    queryFn: () => pendingProductsById(id),
    refetchOnWindowFocus: false,
  });
};
