import { useQuery } from "@tanstack/react-query";
import { getAllInventory, getInventory } from "./inventory.actions";
import { InventoryResource, InventoryResponse } from "./inventory.interface";

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

export const useAllInventory = (params?: Record<string, any>) => {
  return useQuery<InventoryResource[]>({
    queryKey: ["inventory-stock", "all", params],
    queryFn: () => getAllInventory({ params }),
    refetchOnWindowFocus: false,
  });
};
