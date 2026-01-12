import { useQuery } from "@tanstack/react-query";
import { SUPPLIER_ORDER } from "./supplierOrder.constants";
import {
  SupplierOrderResource,
  SupplierOrderResponse,
} from "./supplierOrder.interface";
import {
  findSupplierOrderById,
  getAllSupplierOrder,
  getSupplierOrder,
} from "./supplierOrder.actions";

const { QUERY_KEY } = SUPPLIER_ORDER;

export const useSupplierOrder = (params?: Record<string, any>) => {
  return useQuery<SupplierOrderResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getSupplierOrder({ params }),
    refetchOnWindowFocus: false,
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
