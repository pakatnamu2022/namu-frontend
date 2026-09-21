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
  getAvailableTraverseItems,
  getNextCorrelative,
  getVehiclePurchaseOrder,
} from "./vehiclePurchaseOrder.actions";
import { PurchaseOrderItemTraverseResponse } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.interface";

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

export const useVehiclePurchaseOrderById = (id: number, enabled = true) => {
  return useQuery<VehiclePurchaseOrderResource>({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findVehiclePurchaseOrderById(id),
    refetchOnWindowFocus: false,
    enabled,
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

export const useAvailableTraverseItems = (params: {
  electronic_document_id: number;
  search?: string;
  page?: number;
  per_page?: number;
}) => {
  return useQuery<PurchaseOrderItemTraverseResponse>({
    queryKey: [QUERY_KEY, "available-traverse", params],
    queryFn: () => getAvailableTraverseItems(params),
    enabled: !!params.electronic_document_id && params.electronic_document_id > 0,
    refetchOnWindowFocus: false,
  });
};
