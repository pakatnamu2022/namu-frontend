import { useQuery } from "@tanstack/react-query";
import { getInventoryMovements } from "./inventoryMovements.actions";
import { InventoryMovementResponse } from "./inventoryMovements.interface";

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
