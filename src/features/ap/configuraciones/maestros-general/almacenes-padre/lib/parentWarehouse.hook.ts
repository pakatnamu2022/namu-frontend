import { useQuery } from "@tanstack/react-query";
import {
  ParentWarehouseResource,
  ParentWarehouseResponse,
} from "./parentWarehouse.interface";
import {
  findParentWarehouseById,
  getAllParentWarehouse,
  getParentWarehouse,
} from "./parentWarehouse.actions";
import { PARENT_WAREHOUSE } from "./parentWarehouse.constants";

const { QUERY_KEY } = PARENT_WAREHOUSE;

export const useParentWarehouse = (params?: Record<string, any>) => {
  return useQuery<ParentWarehouseResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getParentWarehouse({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllParentWarehouse = (params?: Record<string, any>) => {
  return useQuery<ParentWarehouseResource[]>({
    queryKey: [QUERY_KEY, "all", params],
    queryFn: () => getAllParentWarehouse({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useParentWarehouseById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findParentWarehouseById(id),
    refetchOnWindowFocus: false,
  });
};
