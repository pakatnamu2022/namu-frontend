import { useQuery } from "@tanstack/react-query";
import { VEHICLE_PURCHASE_ORDER } from "./vehiclePurchaseOrder.constants";
import {
  VehiclePurchaseOrderResponse,
  VehiclePurchaseOrderResource,
} from "./vehiclePurchaseOrder.interface";
import {
  findVehiclePurchaseOrderById,
  getAllVehiclePurchaseOrder,
  getVehiclePurchaseOrder,
} from "./vehiclePurchaseOrder.actions";

const { QUERY_KEY } = VEHICLE_PURCHASE_ORDER;

export const useVehiclePurchaseOrder = (params?: Record<string, any>) => {
  return useQuery<VehiclePurchaseOrderResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getVehiclePurchaseOrder({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllVehiclePurchaseOrder = (params?: Record<string, any>) => {
  return useQuery<VehiclePurchaseOrderResource[]>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getAllVehiclePurchaseOrder({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useVehiclePurchaseOrderById = (id: number) => {
  return useQuery<VehiclePurchaseOrderResource>({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findVehiclePurchaseOrderById(id),
    refetchOnWindowFocus: false,
  });
};
