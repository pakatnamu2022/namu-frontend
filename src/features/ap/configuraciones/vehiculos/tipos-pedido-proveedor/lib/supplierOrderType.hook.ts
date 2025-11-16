import { useQuery } from "@tanstack/react-query";
import {
  findSupplierOrderTypeById,
  getAllSupplierOrderType,
  getSupplierOrderType,
} from "./supplierOrderType.actions";
import {
  SupplierOrderTypeResource,
  SupplierOrderTypeResponse,
} from "./supplierOrderType.interface";
import { SUPPLIER_ORDER_TYPE } from "./supplierOrderType.constants";

const { QUERY_KEY } = SUPPLIER_ORDER_TYPE;

export const useSupplierOrderType = (params?: Record<string, any>) => {
  return useQuery<SupplierOrderTypeResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getSupplierOrderType({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllSupplierOrderType = (params?: Record<string, any>) => {
  return useQuery<SupplierOrderTypeResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllSupplierOrderType({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useSupplierOrderTypeById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findSupplierOrderTypeById(id),
    refetchOnWindowFocus: false,
  });
};
