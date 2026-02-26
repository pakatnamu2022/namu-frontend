import { useQuery } from "@tanstack/react-query";
import { VEHICLE_PURCHASE_ORDER } from "./vehiclePurchaseOrder.constants";
import {
  NextCorrelativeResponse,
  VehiclePurchaseOrderResponse,
  VehiclePurchaseOrderResource,
} from "./vehiclePurchaseOrder.interface";
import {
  findVehiclePurchaseOrderById,
  getAllVehiclePurchaseOrder,
  getNextCorrelative,
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

export const useNextCorrelative = (
  sedeId?: number,
  typeOperationId?: number,
) => {
  return useQuery<NextCorrelativeResponse>({
    queryKey: [QUERY_KEY, "next-correlative", sedeId, typeOperationId],
    queryFn: () => getNextCorrelative(sedeId!, typeOperationId!),
    enabled: !!sedeId && !!typeOperationId,
  });
};
