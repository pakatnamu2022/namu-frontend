import { useQuery } from "@tanstack/react-query";
import { WAREHOUSE } from "./warehouse.constants";
import { WarehouseResource, WarehouseResponse } from "./warehouse.interface";
import {
  findWarehouseById,
  getAllWarehouse,
  getWarehouseByModelSede,
  getWarehouse,
  getWarehousesByCompany,
} from "./warehouse.actions";

const { QUERY_KEY } = WAREHOUSE;

export const useWarehouse = (params?: Record<string, any>) => {
  return useQuery<WarehouseResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getWarehouse({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllWarehouse = (params?: Record<string, any>) => {
  return useQuery<WarehouseResource[]>({
    queryKey: [QUERY_KEY, "all", params],
    queryFn: () => getAllWarehouse({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useWarehouseByModelSede = ({
  model_vn_id,
  sede_id,
  is_received,
}: {
  model_vn_id?: string;
  sede_id?: string;
  is_received?: number;
}) => {
  return useQuery<WarehouseResource[]>({
    queryKey: [QUERY_KEY, "byModelSede", model_vn_id, sede_id],
    queryFn: () =>
      getWarehouseByModelSede({
        params: { model_vn_id, sede_id, is_received },
      }),
    refetchOnWindowFocus: false,
    enabled: !!model_vn_id && !!sede_id,
  });
};

export const useWarehousesByCompany = ({
  my,
  is_received,
  ap_class_article_id,
  empresa_id,
  type_operation_id,
  only_physical = 0,
}: {
  my?: number;
  is_received?: number;
  ap_class_article_id?: string;
  empresa_id?: number;
  type_operation_id?: number;
  only_physical?: number;
}) => {
  return useQuery<WarehouseResource[]>({
    queryKey: [
      QUERY_KEY,
      "byCompany",
      my,
      is_received,
      ap_class_article_id,
      empresa_id,
      type_operation_id,
    ],
    queryFn: () =>
      getWarehousesByCompany({
        params: {
          my,
          is_received,
          ap_class_article_id,
          empresa_id,
          type_operation_id,
          only_physical,
        },
      }),
    refetchOnWindowFocus: false,
    enabled: !!ap_class_article_id && only_physical === 0 ? false : true,
  });
};

export const useWarehouseById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findWarehouseById(id),
    refetchOnWindowFocus: false,
    enabled: !!id,
  });
};
