import { useQuery } from "@tanstack/react-query";
import {
  getInventory,
  getInventoryKardex,
  getInventoryMovements,
  getProductPurchaseHistory,
} from "./inventory.actions.ts";
import { InventoryResponse } from "./inventory.interface.ts";
import {
  InventoryMovementResponse,
  PurchaseHistoryResponse,
} from "./inventoryMovements.interface.ts";

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
