import { useQuery } from "@tanstack/react-query";
import {
  getInventory,
  getInventoryKardex,
  getInventoryMovements,
} from "./inventory.actions";
import { InventoryResponse } from "./inventory.interface";
import { InventoryMovementResponse } from "./inventoryMovements.interface";

export const useInventory = (
  params?: Record<string, any>,
  options?: { enabled?: boolean }
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
  options?: { enabled?: boolean }
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
  options?: { enabled?: boolean }
) => {
  return useQuery<InventoryMovementResponse>({
    queryKey: ["inventory-movements", params],
    queryFn: () => getInventoryKardex({ params }),
    refetchOnWindowFocus: false,
    enabled: options?.enabled ?? true,
  });
};
