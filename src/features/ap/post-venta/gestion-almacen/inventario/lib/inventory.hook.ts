import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getInventory,
  getInventoryKardex,
  getInventoryMovements,
  getProductPurchaseHistory,
  getCompareDynamics,
  updateInventoryStockMinMax,
  getPriceCalculationDetails,
} from "./inventory.actions.ts";
import {
  CompareDynamicsResponse,
  InventoryResponse,
  PriceCalculationDetailsResponse,
} from "./inventory.interface.ts";
import {
  InventoryMovementResponse,
  PurchaseHistoryResponse,
} from "./inventoryMovements.interface.ts";
import { errorToast, successToast } from "@/core/core.function.ts";

export const useInventory = (
  params?: Record<string, any>,
  options?: { enabled?: boolean },
) => {
  return useQuery<InventoryResponse>({
    queryKey: ["inventory-stock", params],
    queryFn: () => getInventory({ params }),
    refetchOnWindowFocus: false,
    enabled: options?.enabled ?? true,
  });
};

export const useInventoryMovements = (
  productId: number,
  warehouseId: number,
  params?: Record<string, any>,
  options?: { enabled?: boolean },
) => {
  return useQuery<InventoryMovementResponse>({
    queryKey: ["inventory-movements", productId, warehouseId, params],
    queryFn: () => getInventoryMovements({ productId, warehouseId, params }),
    refetchOnWindowFocus: false,
    enabled: options?.enabled ?? true,
  });
};

export const useInventoryKardex = (
  params?: Record<string, any>,
  options?: { enabled?: boolean },
) => {
  return useQuery<InventoryMovementResponse>({
    queryKey: ["inventory-movements", params],
    queryFn: () => getInventoryKardex({ params }),
    refetchOnWindowFocus: false,
    enabled: options?.enabled ?? true,
  });
};

export const useCompareDynamics = (
  warehouseId: number,
  options?: { enabled?: boolean },
) => {
  return useQuery<CompareDynamicsResponse>({
    queryKey: ["compare-dynamics", warehouseId],
    queryFn: () => getCompareDynamics({ warehouse_id: warehouseId }),
    refetchOnWindowFocus: false,
    enabled: options?.enabled ?? true,
  });
};

export const useProductPurchaseHistory = (
  productId: number,
  warehouseId: number,
  params?: { date_from?: string; date_to?: string; search?: string },
  options?: { enabled?: boolean },
) => {
  return useQuery<PurchaseHistoryResponse>({
    queryKey: ["purchase-history", productId, warehouseId, params],
    queryFn: () =>
      getProductPurchaseHistory({ productId, warehouseId, params }),
    refetchOnWindowFocus: false,
    enabled: options?.enabled ?? true,
  });
};

export const usePriceCalculationDetails = (
  productId: number,
  warehouseId: number,
  options?: { enabled?: boolean },
) => {
  return useQuery<PriceCalculationDetailsResponse>({
    queryKey: ["price-calculation-details", productId, warehouseId],
    queryFn: () => getPriceCalculationDetails(productId, warehouseId),
    refetchOnWindowFocus: false,
    enabled: options?.enabled ?? false,
  });
};

export const useUpdateInventoryStockMinMax = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      updateInventoryStockMinMax(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-stock"] });
      successToast("Stock mínimo/máximo actualizado correctamente");
    },
    onError: () => {
      errorToast("Error al actualizar el stock mínimo/máximo");
    },
  });
};
