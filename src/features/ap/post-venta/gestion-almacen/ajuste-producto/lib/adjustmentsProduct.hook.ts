import { useQuery } from "@tanstack/react-query";
import {
  AdjustmentsProductResource,
  AdjustmentsProductResponse,
} from "./adjustmentsProduct.interface.ts";
import {
  findAdjustmentsProductById,
  getAdjustmentsProduct,
  getAllAdjustmentsProduct,
} from "./adjustmentsProduct.actions.ts";

export const useAdjustmentsProduct = (params?: Record<string, any>) => {
  return useQuery<AdjustmentsProductResponse>({
    queryKey: ["inventory-movements", params],
    queryFn: () => getAdjustmentsProduct({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllAdjustmentsProduct = (params?: Record<string, any>) => {
  return useQuery<AdjustmentsProductResource[]>({
    queryKey: ["inventory-movements", "all", params],
    queryFn: () => getAllAdjustmentsProduct({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAdjustmentsProductById = (id: number) => {
  return useQuery({
    queryKey: ["inventory-movements", id],
    queryFn: () => findAdjustmentsProductById(id),
    refetchOnWindowFocus: false,
  });
};
